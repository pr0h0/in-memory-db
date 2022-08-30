/* query specs */
/*
    {
        table: 'User',
        type: 'single' | 'all',
        condition: (parent, child)=> parent.user_id === child.id // or any other valid condition
    }
*/

/* condition specs */
/*
    (row) => row.id === someUserVariable
*/

class InMemoryDB {
  #tables = [];
  #columns = {};
  #data = {};

  constructor(data, options) {
    const metadata = {
      tables: data?.metadata?.tables || options?.tables || null,
      columns: data?.metadata?.columns || options?.columns || null,
    };

    console.log({ metadata });

    if (
      !metadata.tables ||
      !metadata.columns ||
      (metadata.tables?.length && !Object.keys(metadata.columns).length)
    ) {
      throw new Error(
        "You need to pass both metadata about tables and columns"
      );
    }

    this.#tables = [];
    this.#columns = {};
    this.#data = { ...data, metadata: undefined };
  }

  /**
   * Function that search for one row and returns it or null if no row found
   * @param {string} table Name of table where condition will be checked
   * @param {func} condition function that will be used to check condition
   * @param {Array} queries Array of queries that will be used to include other tables in result
   * @returns Single row or null if no row found
   */
  findOne(table, condition, queries) {
    const tableData = this.#data[table];
    if (!tableData) {
      throw new Error(`Table ${table} not found`);
    }

    let row = tableData.find(condition) || null;

    if (row && queries?.length) {
      row = this.#handleQueries(row, queries);
    }
    return row;
  }

  /**
   * Function that search for all rows and returns them or empty array if no rows found
   * @param {string} table Name of table where condition will be checked
   * @param {func} condition function that will be used to check condition
   * @param {Array} queries Array of queries that will be used to include other tables in result
   * @returns Array or result rows or empty array if no rows found
   */
  findAll(table, condition, queries) {
    const tableData = this.#data[table];
    if (!tableData) {
      throw new Error(`Table ${table} not found`);
    }

    const rows = tableData
      .filter(condition)
      .map((row) => this.#handleQueries(row, queries || []));
    return rows;
  }

  #handleQueries(row, queries) {
    queries.forEach((query) => {
      if (query.table && query.type && query.condition) {
        if (query.type === "single") {
          row[query.table] =
            this.#data[query.table].find((child) =>
              query.condition(row, child)
            ) || null;
        } else if (query.type === "all") {
          row[query.table] =
            this.#data[query.table].filter((child) =>
              query.condition(row, child)
            ) || [];
        }
      } else {
        console.log("Invalid query", JSON.stringify(query));
      }
    });

    return row;
  }
}

module.exports = InMemoryDB;
