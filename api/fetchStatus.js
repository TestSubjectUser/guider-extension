const LOCATION_ENDPOINT = "http://localhost:3000/api";

export default fetchStatus = () => {
  fetch(LOCATION_ENDPOINT)
    .then((response) => response.json())
    .then((data) => {
      // const filteredLocations = data.map((loc) => ({
      // 	id: loc.id,
      // 	name: loc.name,
      // 	shortName: loc.shortName,
      // 	tzData: loc.tzData,
      // }));
      // filteredLocations.sort((a, b) => a.name.localeCompare(b.name));
      // chrome.storage.local.set({ locations: filteredLocations });
      console.log("data: ", data);
    })
    .catch((error) => {
      console.log(error);
    });
};
