import fs from 'fs';
import path from 'path';

// Ensure standard data directory exists for mock persistence
const DATA_DIR = path.resolve('data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Plain JSON database helpers
const readData = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    return [];
  }
};

const writeData = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const generateId = () => 
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
    this.hooks = { pre: {} };
    this.methods = {};
  }

  pre(hookName, fn) {
    this.hooks.pre[hookName] = fn;
  }
}

// High-fidelity Query Promise wrapper that implements Mongoose select() and sort() chainable methods
function createQueryPromise(asyncFn) {
  const promise = (async () => {
    return await asyncFn();
  })();

  promise.select = function (fields) {
    // Return same query promise to support further chains
    return this;
  };

  promise.sort = function (sortQuery) {
    const sortedPromise = (async () => {
      const result = await promise;
      if (Array.isArray(result)) {
        const key = Object.keys(sortQuery)[0];
        const order = sortQuery[key];
        return result.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;
          return valA > valB ? order : -order;
        });
      }
      return result;
    })();

    sortedPromise.select = function () {
      return this;
    };
    return sortedPromise;
  };

  return promise;
}

const mongoose = {
  Schema: class extends Schema {
    static get Types() {
      return {
        ObjectId: 'ObjectId'
      };
    }
  },
  
  connect: async () => {
    console.log('✨ [JSON-DB] Mock MongoDB Connected Successfully (File Persisted in backend/data/)');
    return { connection: { host: 'localhost-json-db' } };
  },

  model: (modelName, schema) => {
    const filename = `${modelName.toLowerCase()}s.json`;

    class Model {
      constructor(data) {
        Object.assign(this, data);
        if (!this._id) {
          this._id = generateId();
        }
        if (!this.createdAt) {
          this.createdAt = new Date().toISOString();
        }
        this.updatedAt = new Date().toISOString();

        // Bind model instance methods
        for (const [key, fn] of Object.entries(schema.methods)) {
          this[key] = fn.bind(this);
        }
      }

      isModified(path) {
        // Return true to trigger the pre-save password hash on new creation or updates
        return true;
      }

      async save() {
        // Run pre-save hook chains (e.g. Password Encryption)
        if (schema.hooks.pre['save']) {
          await new Promise((resolve, reject) => {
            schema.hooks.pre['save'].call(this, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }

        const items = readData(filename);
        const idx = items.findIndex((item) => item._id === this._id);

        const docData = { ...this };
        // Avoid saving functions/methods to plain JSON
        for (const key of Object.keys(schema.methods)) {
          delete docData[key];
        }

        if (idx >= 0) {
          docData.updatedAt = new Date().toISOString();
          items[idx] = docData;
        } else {
          items.push(docData);
        }

        writeData(filename, items);
        return this;
      }

      static async create(data) {
        const inst = new Model(data);
        await inst.save();
        return inst;
      }

      static findOne(query) {
        return createQueryPromise(async () => {
          const items = readData(filename);
          const found = items.find((item) => Model.match(item, query));
          return found ? new Model(found) : null;
        });
      }

      static findById(id) {
        return createQueryPromise(async () => {
          if (!id) return null;
          const matchId = typeof id === 'object' ? id.toString() : id;
          const items = readData(filename);
          const found = items.find((item) => Model.match(item, { _id: matchId }));
          return found ? new Model(found) : null;
        });
      }

      static find(query = {}) {
        return createQueryPromise(async () => {
          const items = readData(filename);
          const matched = items.filter((item) => Model.match(item, query));
          return matched.map((item) => new Model(item));
        });
      }

      static async findOneAndDelete(query) {
        const items = readData(filename);
        const idx = items.findIndex((item) => Model.match(item, query));
        if (idx >= 0) {
          const deleted = items.splice(idx, 1)[0];
          writeData(filename, items);
          return new Model(deleted);
        }
        return null;
      }

      static async updateMany(query, update) {
        const items = readData(filename);
        let modifiedCount = 0;
        const setValues = update.$set || {};

        const updated = items.map((item) => {
          if (Model.match(item, query)) {
            modifiedCount++;
            return {
              ...item,
              ...setValues,
              updatedAt: new Date().toISOString()
            };
          }
          return item;
        });

        if (modifiedCount > 0) {
          writeData(filename, updated);
        }
        return { modifiedCount };
      }

      static async countDocuments(query = {}) {
        const items = readData(filename);
        return items.filter((item) => Model.match(item, query)).length;
      }

      // MongoDB match queries syntax parser
      static match(item, query) {
        for (const [key, value] of Object.entries(query)) {
          if (key === '$or' && Array.isArray(value)) {
            const orMatch = value.some((subQuery) => Model.match(item, subQuery));
            if (!orMatch) return false;
            continue;
          }

          const itemValue = item[key];

          if (value && typeof value === 'object') {
            if (value.$ne !== undefined && itemValue === value.$ne) return false;
            if (value.$lt !== undefined && !(new Date(itemValue) < new Date(value.$lt))) return false;
            if (value.$gt !== undefined && !(new Date(itemValue) > new Date(value.$gt))) return false;
            if (value.$regex !== undefined) {
              const flags = value.$options || '';
              const re = new RegExp(value.$regex, flags);
              if (!re.test(itemValue || '')) return false;
            }
            continue;
          }

          // Strict mapping check
          if (itemValue !== value) return false;
        }
        return true;
      }
    }

    return Model;
  }
};

export default mongoose;
