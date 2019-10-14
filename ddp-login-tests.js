// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by ddp-login.js.
import { name as packageName } from "meteor/leaonline:ddp-login";

// Write your tests here!
// Here is an example.
Tinytest.add('ddp-login - example', function (test) {
  test.equal(packageName, "ddp-login");
});
