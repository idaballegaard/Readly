process.env.NODE_ENV = "test";

import { test } from "@playwright/test";

// Test case imports
import health from "./health.test";
import userTestCollection from "./user.test";
import authTestCollection from "./auth.test";
import booksTestCollection from "./books.test";
import favoritesTestCollection from "./favorites.test";
import queryTestCollection from "./query.test";

// Model imports for database cleanup
import { userModel } from "../src/models/userModel";
import { bookModel } from "../src/models/bookModel";

import DotenvFlow from "dotenv-flow";
import { connect, disconnect } from "../src/repository/database";

DotenvFlow.config();

function setup() {
  //beforeEach clear test database
  test.beforeEach(async () => {
    try {
      await connect();
      await userModel.deleteMany({});
      await bookModel.deleteMany({});
    } finally {
      await disconnect();
    }
  });
  //afterAll clear the testdatabase
  test.afterAll(async () => {
    try {
      await connect();
      await userModel.deleteMany({});
      await bookModel.deleteMany({});
    } finally {
      await disconnect();
    }
  });
}

setup();

test.describe(health);
test.describe(userTestCollection);
test.describe(authTestCollection);
test.describe(booksTestCollection);
test.describe(favoritesTestCollection);
test.describe(queryTestCollection);
