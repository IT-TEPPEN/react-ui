// Run tests in a time zone ahead of UTC so that date handling bugs caused by
// UTC conversion (e.g. toISOString) show up in CI, which runs in UTC.
module.exports = async () => {
  process.env.TZ = "Asia/Tokyo";
};
