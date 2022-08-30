const InMemoryDB = require("./index");

const fs = require("fs");
const data = JSON.parse(fs.readFileSync("./data.json").toString());

// In case we don't have metadata in json file you need to pass options with metadata about tables and columns
const options = {
  tables: ["User", "Post", "Comment"],
  columns: {
    User: ["id", "name", "email", "password"],
    Post: ["id", "title", "content", "user_id"],
    Comment: ["id", "content", "user_id", "post_id"],
  },
};

// If we have both, options will be used instead of metadata from data
const instance = new InMemoryDB(data, options);

// Find one row without anythign else
console.log(instance.findOne("User", (row) => row.id === 1));

// Find all rows without anythign else
console.log(instance.findAll("User", (row) => true));

// Find one row with other tables
console.log(
  instance.findOne("User", (row) => row.id === 1, [
    {
      table: "Post",
      type: "single",
      condition: (parent, child) => parent.id === child.user_id,
    },
  ])
);

// Find all rows with other tables
console.log(
  instance.findAll("User", (row) => true, [
    {
      table: "Post",
      type: "all",
      condition: (parent, child) => parent.id === child.user_id,
    },
    {
      table: "Comment",
      type: "all",
      condition: (parent, child) => parent.id === child.user_id,
    },
  ])
);
