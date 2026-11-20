const {
  createSeedUsers,
  createSeedLostItems,
  createSeedFoundItems,
  createSeedClaims,
} = require("../db/seedData");

const demoStore = {
  users: [],
  lostItems: [],
  foundItems: [],
  claims: [],
};

function resetDemoStore() {
  demoStore.users = createSeedUsers();
  demoStore.lostItems = createSeedLostItems();
  demoStore.foundItems = createSeedFoundItems();
  demoStore.claims = createSeedClaims();
}

resetDemoStore();

module.exports = { demoStore, resetDemoStore };
