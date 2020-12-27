import React from "react";
// import logo from "./logo.svg";
import logoCentigrade from "./thermometer.png";
import { Map, GoogleApiWrapper, InfoWindow, Marker } from "google-maps-react";
import "./App.css";
import Geocode from "react-geocode";
const axios = require("axios");
const moment = require("moment");
// const mapStyles = {
//   width: "35%",
//   height: "60%",
// };

const containerStyle = {
  // position: "absolute",
  // width: "50rem",
  // width: "80%",
  height: "50%",
  width: "514px",
  // height: "480px",
  // position: "relative",
};
// set Google Maps Geocoding API for purposes of quota management. Its optional but recommended.
Geocode.setApiKey("AIzaSyBf5r8T5cUQegFU2OcR8qbscn-LqHgmleQ");

// set response language. Defaults to english.
Geocode.setLanguage("en");

// set response region. Its optional.
// A Geocoding request with region=es (Spain) will return the Spanish city.
Geocode.setRegion("es");

// Enable or disable logs. Its optional.
Geocode.enableDebug();
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      arr: [],
      arrRates: [],
      showingInfoWindow: false, // Hides or shows the InfoWindow
      activeMarker: {}, // Shows the active marker upon click
      selectedPlace: {}, // Shows the InfoWindow to the selected place upon a marker
      lat: null,
      lng: null,
      toggleChange: false,
    };
  }

  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true,
    });

  onClose = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
      });
    }
  };
  componentDidMount() {
    this.getData();
    this.getLocation();
    setTimeout(() => this.getWeatherData(), 2000);
    setTimeout(() => {
      this.setState({ toggleChange: true });
    }, 1000 * 60 * 15);

    setInterval(() => this.getWeatherData(), 1000 * 60 * 30);
  }

  getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position);
        this.setState({
          lat: Number(position.coords.latitude),
          lng: Number(position.coords.longitude),
        });
      });
    }
  };
  getWeatherData = () => {
    const { lat, lng } = this.state;
    var arrData = [];
    return fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&appid=3c87e20e286cbedfe37725bece8834ad`
    )
      .then((response) => response.json())
      .then((json) => {
        arrData.push(json);
        this.setState({
          arr: json,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  async getData() {
    var arrData = [];
    try {
      let res = await axios({
        url:
          "https://cors-anywhere.herokuapp.com/https://v2.api.forex/rates/latest.json?from=USD&key=2cf07889-ccce-44bb-9e83-b276403d3b4c",
        method: "get",
        timeout: 3000, // 3 seconds tak data nhi mila to terminate
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status === 200) {
        // test for status you want, etc
        for (var key in res.data.rates) {
          arrData.push(
            Object.assign({ name: key, value: res.data.rates[key] })
          );
        }
      }
      // Don't forget to return something
      return this.setState({
        arrRates: arrData,
      });
    } catch (err) {
      console.error(err);
    }
  }
  render() {
    const { lat, lng, arr, arrRates, toggleChange } = this.state;

    const {
      daily,
      timezone,

      current: { temp } = ({} = {}),
    } = arr || {};

    return (
      <div>
        {/* <div> */}
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            <a className="navbar-brand" href="/#">
              Weather with Location
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            ></div>
          </div>
        </nav>
        {/* </div> */}

        <div className="container" style={{ marginTop: 10 }}>
          {toggleChange && (
            <div class="alert alert-danger" role="alert">
              Weather Update, Please Refresh!
            </div>
          )}
          <div class="row">
            <div class="col-sm-12 col-md-6 alert alert-primary">
              <h1
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {moment().format("MMM Do YYYY, h:mm:ss a")}
                <span onClick={() => window.location.reload()}>
                  <i class="fa fa-refresh fa-fw"></i>
                </span>
              </h1>

              <h1 style={{ display: "flex", alignItems: "center" }}>
                {temp}
                <img
                  src={logoCentigrade}
                  style={{ height: 35, width: 35, marginLeft: 5 }}
                  alt="logo"
                />
              </h1>

              <h5
                class="card-title"
                style={{ display: "flex", alignItems: "center" }}
              >
                {timezone}
              </h5>
              <h5
                class="card-text"
                style={{ display: "flex", justifyContent: "center" }}
              >
                Next 7 Days Forecast
              </h5>

              <table class="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Days</th>
                    <th scope="col">Temp</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {daily &&
                    daily.slice(1, 8).map((e, i) => {
                      return (
                        <tr key={i}>
                          <td scope="row">{i + 1}</td>
                          <td scope="row">
                            {/* {new Date(e.dt * 1000 - timezone_offset * 1000)} */}
                            {/* {e.dt || "dddd, MMMM Do YYYY"} */}
                            {moment.unix(e.dt).format(
                              /* e.dt (return epoch time that why i add moment.unix) */
                              "MMM Do YYYY"
                            )}
                            {/* {new Date(e.dt)} */}
                          </td>

                          <td
                            scope="row"
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            {
                              <img
                                src={`http://openweathermap.org/img/wn/${e.weather[0].icon}@2x.png`}
                                style={{ height: 30, width: 30 }}
                                alt="logo"
                              />
                            }
                            {/* {`http://openweathermap.org/img/wn/${e.weather[0].icon}@2x.png`} */}
                            {e.temp.day.toFixed(0)}
                          </td>
                          <td scope="row">
                            {e.weather[0].main} | {e.weather[0].description}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div class="col-sm-12 col-md-6 ">
              <div class="row">
                <div class="col-sm-12 col-md-8">
                  {lat === null && lng === null ? (
                    <div>Loading...</div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        // flexWrap: "wrap",
                        position: "relative !important",
                        height: "500px !important",
                        // width: "50%",
                      }}
                    >
                      <Map
                        google={this.props.google}
                        zoom={14}
                        containerStyle={containerStyle}
                        // style={mapStyles}
                        initialCenter={{
                          // lat: -1.2884,
                          // lng: 36.8233,
                          lat: lat,
                          lng: lng,
                        }}
                      >
                        <Marker
                          position={{ lat: lat, lng: lng }}
                          onClick={this.onMarkerClick}
                          name={timezone}
                        />
                        <InfoWindow
                          marker={this.state.activeMarker}
                          visible={this.state.showingInfoWindow}
                          onClose={this.onClose}
                        >
                          <div>
                            <h4>{timezone}</h4>
                          </div>
                        </InfoWindow>
                      </Map>
                    </div>
                  )}
                </div>
                <div
                  class="col-12 alert alert-primary"
                  style={{ marginTop: "23rem", marginLeft: 5 }}
                >
                  <h1>Today's Rate </h1>
                  <table class="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Currency</th>
                        <th scope="col">Price</th>
                        {/* <th scope="col">Change</th> */}
                      </tr>
                    </thead>

                    <tbody>
                      {arrRates &&
                        arrRates.slice(0, 3).map((e, i) => {
                          return (
                            <tr key={i}>
                              <td scope="row">{i + 1}</td>
                              <td scope="row">{e.name}</td>

                              <td
                                scope="row"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {e.value}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyBf5r8T5cUQegFU2OcR8qbscn-LqHgmleQ",
})(App);
