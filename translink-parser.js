// Import dependencies using ES Modules
import fs from 'fs';
import promptSync from 'prompt-sync';
const prompt = promptSync({
  sigint: true
});
import fetch from "node-fetch";
import {parse} from 'csv-parse/sync';

// The main app logic
async function main() {

  // Declare global variables
  const routesStatic = "static-data/routes.txt";
  const tripsStatic = "static-data/trips.txt";
  const stopTimesStatic = "static-data/stop_times.txt";
  const stopsStatic = "static-data/stops.txt"; // For more accurate stops (stop_id) like stop A - UQ Lakes
  const calendarStatic = "static-data/calendar.txt";
  const tripUpdatesURL = "http://127.0.0.1:5343/gtfs/seq/trip_updates.json";
  const vehiclePositionsURL = "http://127.0.0.1:5343/gtfs/seq/vehicle_positions.json";
  const alertsURL = "http://127.0.0.1:5343/gtfs/seq/alerts.json";
  const busRoutes = ["Show All Routes", '66', '192', '169', '209', '29', 'P332', '139', '28'];
  const busRoutesString = JSON.stringify(busRoutes);
  const jsonFilename = (append) => `translink-${append}.json`;
  const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  // Declare message global variables
  let messageWelcome = "Welcome to the UQ Lakes station bus tracker!";
  let messagePromptDate = "What date will you depart UQ Lakes station by bus?";
  let messagePromptTime = "What time will you depart UQ Lakes station by bus?";
  let messagePromptBusRoutes = "Please choose a bus route.";
  let messagePromptResearch = "Would you like to search again?";
  let messageDateInvalid = "Incorrect date format. Please use YYYY-MM-DD";
  let messageTimeInvalid = "Incorrect time format. Please use HH:mm";
  let messageBusRouteInvalid = "Please enter a valid option for a bus route.";
  let messageResearchInvalid = "Please enter a valid option.";
  let messageLoadedBusData = "Finished loading bus data";
  let messageReturningBusData = "Bus with matching results";
  let messageEndProgram = "Thanks for using the UQ Lakes station bus tracker!";
  let messageSaveCache = (filenameAppend) => `Saved a JSON cache file called "${jsonFilename(filenameAppend)}".`;
  let messageReadCache = (filenameAppend) => `Read a JSON cache file called "${jsonFilename(filenameAppend)}".`;
  
  // Display loaded bus data message
  console.log(messageLoadedBusData);

  // Display Welcome message
  console.log(messageWelcome);

  /**
   * This function converts the user input to a day of week.
   * @param {string} promptDate - a date in YYYY-MM-DD format.
   * @returns {string} userInputWeekday - corresponding weekday of the promptDate.
   */
  function convertDateToWeekday(promptDate) {
    const promptDateToDate = new Date(promptDate);
    const userInputWeekday = weekDays[promptDateToDate.getDay()];
    return userInputWeekday;
  }
  
  /**
   * This function takes the user input, validate if the input follows the YYYY-MM-DD format, 
   * and convert the input to YYYYMMMDD.
   * @param {string} promptDate - a date in YYYY-MM-DD format.
   * @returns {string} formattedDate - a date in YYYYMMDD format.
   */
  function validateDate(promptDate) {
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateFormat.test(promptDate)) {
      console.log(messageDateInvalid);
      return null;
    }

    const formattedDate = promptDate.replace(/-/g, '');
    return formattedDate;

  }

  // Placeholder for validDate
  let validDate = null;
  let convertedDateToWeekday = null;

  /**
   * This while loop keep prompting user's date input until the date format is validated.
   * @param {string} validDate - either null or a date value in YYYYMMDD.
   */
  while (validDate === null) {
    const promptDate = prompt(messagePromptDate);
    validDate = validateDate(promptDate);
    convertedDateToWeekday = convertDateToWeekday(promptDate);
  }

  /**
   * Time function validates the time user's time input whether in the format of HH:mm.
   * @param {string} promptTime - a time in the format of HH:mm.
   * @returns {string} time in format of HH:mm:00 or null if not validated.
   */
  function validateTime(promptTime) {
    const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeFormat.test(promptTime)) {
      console.log(messageTimeInvalid);
      return null;
    }
  }

  // Placeholder for validTime
  let validTime = null;

  /**
   * This while loop keeps prompting user's time input until the time format is validated.
   * @param {string} validTime - either null or a time value in HH:mm format.
   */
  while (validTime === null) {
    const promptTime = prompt(messagePromptTime);
    validTime = validateTime(promptTime);
  }

  // Placeholder for validBusRoutes
  let validBusRoutes = null;

  while (validBusRoutes === null) {
    const userInput = parseInt(prompt(`${messagePromptBusRoutes} ${busRoutesString}`));
  
    if (userInput >= 1 && userInput <= busRoutes.length) {
      validBusRoutes = busRoutes[userInput - 1];
    } else {
      console.log(messageBusRouteInvalid);
    }
  }

  console.log(messageReturningBusData);

  // Section of loading and reading staic data and live data

  /**
  * This function fetches data asynchronously based on the URL provided.
  * @param {string} url - the URL to fetch data from (expecting JSON).
  * @returns {string} the JSON response.
  */
   async function fetchData(url) {
    const response = await fetch(url);
    // console.log(url, response.status); // Testing purposes
    if (response.status == 200) {
      const responseJSON = await response.json();
    return responseJSON;
    }
  };

  // Load live json file
  const [
    tripUpdates,
    vehiclePositions
  ] = await Promise.all([
    fetchData(tripUpdatesURL),
    fetchData(vehiclePositionsURL),
  ]);

  /**
   * This function will save a JSON cache file with the specified filename & data.
   * @param {string} filenameAppend - The string to append to the JSON filename.
   * @param {string} data - The string containing JSON data to save.
   */
  async function saveCache(filenameAppend, data) {
    try {
      await fs.writeFile(jsonFilename(filenameAppend), JSON.stringify(data));
      console.log(messageSaveCache(filenameAppend));
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * This function will read a JSON cache file with the specified filename.
   * @param {string} filenameAppend - The string to append to the JSON filename.
   * @param {string} the JSON data from the cached file.
   */
  async function readCache(filenameAppend) {
    try {
      const data = await fs.readFile(jsonFilename(filenameAppend));
      console.log(messageReadCache(filenameAppend));
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  
  // Load static CSV file
  const parseCSV = (file) => {
    const data = fs.readFileSync(file, 'utf8');
    return parse(data, {
      columns: true
    });
  };

  // Store parsed CSV as variables
  const [
    routes,
    trips,
    stop_times,
    calendar,
    stops
  ] = await Promise.all([
    parseCSV(routesStatic),
    parseCSV(tripsStatic),
    parseCSV(stopTimesStatic),
    parseCSV(calendarStatic),
    parseCSV(stopsStatic)
  ]);

  // Section of filtering

  // Filtering calendar with validDate
  const filteredCalendar = calendar.filter((calRow) => {
    return validDate >= calRow.start_date && validDate <= calRow.end_date && calRow[convertedDateToWeekday] === "1";    }  
  );

  /**
   * This function subtracts 10 minutes from the arrival_time in stop_times.txt, and fit the subtracted time to the correct hour.
   * @param {string} time - The arrival_time in stop_times.txt. 
   * @returns {string} HH:mm:ss which is 10 minutes before the arrival_time.
   */
  function subtract10Minutes(time) {
    const [hours, minutes, seconds] = time.split(':').map(Number);
  
    let newMinutes = minutes - 10;
    let newHours = hours;
  
    if (newMinutes < 0) {
      newHours -= 1;
      newMinutes = 60 + newMinutes;
    }
    const formattedHours = String(newHours).padStart(2, '0');
    const formattedMinutes = String(newMinutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  // Filtering stop_times with the validTime
  const filteredStop_times = stop_times.filter((stop_timesRow) => {
    const arrivalTime = stop_timesRow.arrival_time;
    const subtractedArrivalTime = subtract10Minutes(arrivalTime);
    return validTime >= subtractedArrivalTime && validTime <= arrivalTime;
  });
  
  // Filtering routes with validBusRoutes
  let filteredRoutes = routes;
  if (validBusRoutes !== "Show All Routes") {
    filteredRoutes = routes.filter((routeRow) => {
      return routeRow.route_short_name === validBusRoutes;
    });
  } else {
    filteredRoutes = routes.filter((routeRow) => {
      return routeRow.route_short_name === busRoutes[1] ||
      routeRow.route_short_name === busRoutes[2] ||
      routeRow.route_short_name === busRoutes[3] ||
      routeRow.route_short_name === busRoutes[4] ||
      routeRow.route_short_name === busRoutes[5] ||
      routeRow.route_short_name === busRoutes[6] ||
      routeRow.route_short_name === busRoutes[7] ||
      routeRow.route_short_name === busRoutes[8]
    });
  }

  // Merging filtered routes with trips
  const mergingRoutesAndTrips = (filteredRoutes, trips) => {
    return filteredRoutes.map(filteredRoute => {
      const trip = trips.find(t => t.route_id === filteredRoute.route_id);

      return {
        route_id: filteredRoute.route_id,
        route_short_name: filteredRoute.route_short_name,
        route_long_name: filteredRoute.route_long_name,
        service_id: trip.service_id,
        trip_id: trip.trip_id,
        headsign: trip.trip_headsign,
      };
    });
  };
  
  const mergedRT = mergingRoutesAndTrips(filteredRoutes, trips);

  // Merging filtered calendar with previous 2 CSVs
  const mergingCalendarWith_RoutesAndTrips = (mergedRoutesAndTrips, filteredCalendar) => {
    return mergedRoutesAndTrips.map(mrt => {
      const calRow = filteredCalendar.find(cal => cal.service_id === mrt.service_id);

      return {
        route_id: mrt.route_id,
        route_short_name: mrt.route_short_name,
        route_long_name: mrt.route_long_name,
        service_id: mrt.service_id,
        trip_id: mrt.trip_id,
        headsign: mrt.headsign,
      };
    });
  };

  const mergedCRT = mergingCalendarWith_RoutesAndTrips(mergedRT, filteredCalendar);

  // Merging filtered stop_times with previous 3 CSVs
  const mergingStop_timesWith_RoutesAndTripsAndCalendar = (mergedCalendarWith_RoutesAndTrips, filteredStop_times) => {
    return mergedCalendarWith_RoutesAndTrips.map(mcrt => {
      const stRow = filteredStop_times.find(st => st.trip_id === mcrt.trip_id);

      return {
        route_id: mcrt.route_id,
        route_short_name: mcrt.route_short_name,
        route_long_name: mcrt.route_long_name,
        service_id: mcrt.service_id,
        trip_id: mcrt.trip_id,
        headsign: mcrt.headsign,
      };
    });
  };

  const mergedStCRT = mergingStop_timesWith_RoutesAndTripsAndCalendar(mergedCRT, filteredStop_times);

  console.table(mergedStCRT);

  /**
   * This function takes the user input and validate the value regarding the case sensitivity.
   * @param {string} promptResearch - The user's choice to exit the program or not.
   */
  function validateReseach(promptResearch) {
    const researchInput = promptResearch.toLowerCase();
    if (researchInput === 'y' || researchInput === 'yes') {
      main();
    } else if (researchInput === 'n' || researchInput === 'no') {
      console.log(messageEndProgram);
    } else {
      console.log(messageResearchInvalid);
      const promptResearch = prompt(messagePromptResearch);
      validateReseach(promptResearch);
    }
  }

  const promptResearch = prompt(messagePromptResearch);

  validateReseach(promptResearch);

}

// Call the main function
main();
