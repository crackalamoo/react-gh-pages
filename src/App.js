import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import myService from './services.js';

class App extends Component {
  constructor() {
    super();
    this.companyData = {companyName: "Loading company...", imageLink: "",
      signupPolicy1: "I agree to sign up, and I have reviewed the ", signupPolicy2: " for further details",
      offerHTML: (<div>
        <div class="note">
          <div class="insideBox leftNote">
          </div>
          <div class="insideBox centerInsideBox rightNote">
            <div class="button shareButton centerInsideBox"><p class="BlackAndWhite">Share ⚡</p></div>
          </div>
        </div>
      </div>)};
    this.showData = true;
    this.loading = true;
    this.formComplete = false;
    this.errorHTML = (
      <div class="wholeScreen">
        <h2>We were unable to find the provider. Please check the url.</h2><br/>
        <img class="bigPhone" src="http://taptobook-dev-guestcheckout.azurewebsites.net/content/images/booked-iphone.png?v=3.1" />
        <h3>Discover and Book Last Minute Appointments!<br/>Download our App!</h3><br/>
        <div class="box">
          <a target="_blank" href="https://ttb.app.link/UMDypOUM8A?REFCODE=">
            <img src="http://taptobook-dev-guestcheckout.azurewebsites.net/content/images/apple_download.png?v=3.1" />
          </a>
          &nbsp;
          <a target="_blank" href="https://ttbdev.app.link/1WfnOOLT2B?REFCODE=">
            <img src="http://taptobook-dev-guestcheckout.azurewebsites.net/content/images/google_download.png?v=3.1" />
          </a>
        </div>
      </div>
    );
    this.loadingHTML = (
      <div class="wholeScreen">
        <h2>Loading...</h2>
      </div>
    );
  }
  formatPrice(number) {
    if (number > 0) {
      return "$" + number.toFixed(2);
    } else {
      return "FREE";
    }
  }
  formatService(serviceNumber, services) {
    let service = services[serviceNumber];
    return (
      <div class="offerBox">
        <div class="insideBox leftNote">
          <h3>{service.name}</h3><br/>
          <p class="gray smallText">{service.description}</p>
          <p class="red smallText">{service.limited ? "Only a few left." : null}</p>
        </div>
        <div class="insideBox rightNote priceBox">
          <p class="newPrice">{this.formatPrice(service.discount)}</p>
          <p class="oldPrice">{this.formatPrice(service.originalPrice)}</p>
        </div>
      </div>
    );
  }
  formatCampaign(campaignNumber, campaigns) {
    let campaign = campaigns[campaignNumber];
    return(
      <div class="note">
        <div class="insideBox leftNote">
          <h3>{campaign.name}</h3>
          <p class="gray">{campaign.end}</p>
        </div>
        <div class="insideBox centerInsideBox rightNote">
          <div class="button shareButton centerInsideBox"><p class="BlackAndWhite">Share ⚡</p></div>
        </div>
      </div>
    );
  }
  formatTime(oldTime) {
    let newTime = oldTime;
    if (newTime[0] == "00" && newTime[1] == "00") {
      newTime = "Midnight";
    } else if (newTime[0] == "12" && newTime[1] == "00") {
      newTime = "Noon";
    } else if (Number(newTime[0]) > 12) {
      newTime = (Number(newTime[0]) - 12) + ":" + newTime[1] + " PM";
    } else if (newTime[0] == "00") {
      newTime = "12:" + newTime[1] + " AM";
    } else if (newTime[0] == "12") {
      newTime = "12:" + newTime[1] + " PM";
    } else {
      newTime = newTime[0] + ":" + newTime[1] + " AM";
    }
    return newTime
  }
  formatMonth(month) {
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[Number(month) - 1];
  }
  formatDate(dateString) {
    let dateTime = dateString.split("T");
    let date = dateTime[0].split("-");
    let time = dateTime[1].split(":");
    return "Ends " + this.formatTime(time) + ", " + this.formatMonth(date[1]) + " " + Number(date[2])
  }

  errorScreen() {
    console.log("Error screen");
    this.showData = false;
    this.loading = false;
    this.forceUpdate();
  }

  noCampaign(data) {
    console.log("No campaign");
    let imageLink = data.ProviderData.Details.ProviderInformation.BannerImageUrl;
    let companyName = data.ProviderData.Details.ProviderInformation.BusinessName;
    let offerHTML = <div></div>;
    this.companyData = {companyName: companyName, imageLink: imageLink,
      address1: data.ProviderData.Details.ProviderInformation.Address,
      address2: data.ProviderData.Details.ProviderInformation.City + ", " + data.ProviderData.Details.ProviderInformation.State + " " + data.ProviderData.Details.ProviderInformation.ZipCode,
      fullAddress: data.ProviderData.Details.ProviderInformation.fullAddress,
      signupPolicy1: data.SignupPolicyText, signupPolicy2: data.SignupPolicyTextPart2,
      offerHTML: offerHTML
      };
    document.getElementById("centerBox").style.display = "none";
    document.getElementById("leftBox").style.border = "0px";
    document.getElementById("rightBox").style.width = "calc(100% - 260px)";
    document.getElementById("fname").style.width = "350px";
    document.getElementById("lname").style.width = "350px";
    document.getElementById("email").style.width = "350px";
    document.getElementById("phone").style.width = "350px";
    document.getElementById("submitDiv").style.right = "calc(50% - 260px)";
    this.loading = false;
    document.title = "Guest Checkout – " + companyName + " – No Available Times";
    this.forceUpdate();
  }

  setData(data) {
    console.log("Starting the data processing");
    let imageLink = data.ProviderData.Details.ProviderInformation.BannerImageUrl;
    let companyName = data.ProviderData.Details.ProviderInformation.BusinessName;
    let offerHTML = [];
    let campaigns = [];
    let Campaign = 0;
    let Feature = 0;
    let Service = 0;
    let campaign = "";
    let newCampaign = "";
    let feature = "";
    let service = "";
    let description = "";
    let mainDirectory = data.ProviderData.InsiderOffer.FavoriteOfferVM;
    if (mainDirectory == null) {
      mainDirectory = data.ProviderData.Details.Services
    }
    for (Campaign in data.ProviderData.InsiderOffer.FavoriteOfferVM) {
      campaign = data.ProviderData.InsiderOffer.FavoriteOfferVM[Campaign];
      newCampaign = {name: campaign.CampaignName, end: this.formatDate(campaign.EndDate), title: campaign.CampaignName, services: []};
      for (Feature in campaign.FeatureDetails) {
        feature = campaign.FeatureDetails[Feature];
        for (Service in feature.CustomServices) {
          service = feature.CustomServices[Service];
          if (service.isOffered) {
            description = service.CustomDescription != null ? service.CustomDescription: "Purchase online or redeem in store.";
            newCampaign.services.push({name: service.CustomText, id: service.ProviderCustomFeatureDetailId, description: description,
              originalPrice: service.Amount, discount: service.InsiderPrice, limited: service.IsLimitedQuantity});
          }
        }
      }
      campaigns.push(newCampaign);
    }
    for (campaign in campaigns) {
      offerHTML.push(this.formatCampaign(campaign, campaigns));
      for (service in campaigns[campaign].services) {
        offerHTML.push(this.formatService(service, campaigns[campaign].services));
      }
    }
    this.companyData = {companyName: companyName, imageLink: imageLink,
      address1: data.ProviderData.Details.ProviderInformation.Address,
      address2: data.ProviderData.Details.ProviderInformation.City + ", " + data.ProviderData.Details.ProviderInformation.State + " " + data.ProviderData.Details.ProviderInformation.ZipCode,
      fullAddress: data.ProviderData.Details.ProviderInformation.fullAddress,
      signupPolicy1: data.SignupPolicyText, signupPolicy2: data.SignupPolicyTextPart2,
      offerHTML: offerHTML
      };
    console.log("Set data");
    console.log(this.companyData);
    this.loading = false;
    document.title = "Guest Checkout – " + companyName + " – Services";
    this.forceUpdate();
  }

  checkButtons() {
    let oldComplete = this.checkButtons;
    let agreement = document.getElementById("agree").checked;
    let fname = (document.getElementById("fname").value != "");
    let lname = (document.getElementById("lname").value != "");
    let email = (document.getElementById("email").value != "" && document.getElementById("email").value.includes("@") && document.getElementById("email").value.length > 2);
    let phone = (document.getElementById("phone").value != "" && !(document.getElementById("phone").value.match(/[a-z]/i)));
    this.formComplete = (agreement && fname && lname && email && phone);
    if (this.formComplete != oldComplete) {
      if (this.formComplete) {
        document.getElementById("submit").classList.add("button");
        document.getElementById("submit").classList.remove("inactiveButton");
      } else {
        document.getElementById("submit").classList.remove("button");
        document.getElementById("submit").classList.add("inactiveButton");
      }
    }
  }

  componentWillMount() {
    // Dev Retail: s1192
    // Bamangwato Socks: A92EE0
    // Definitely Not Poisoned Food: CBF798
    // Washington's Training Camp: C5542D
    // Union Army: AD0BD4
    let companyCode = "OA95871";
    let propDataArray = window.location.href.substr(1).split("&");
    if (propDataArray[0].startsWith("companyID")) {
      propDataArray = {companyID: propDataArray[0].substr(propDataArray[0].indexOf("=") + 1)};
      companyCode = propDataArray.companyID;
    } else {
      propDataArray = {companyID: ""};
    }
    let url = "https://taptobook-qa.azurewebsites.net/api/version/3_1/ProviderAsync/GetHashCodeDetails?hashCode=" + companyCode + "&resetShowChat=true&updateAnalytics=true";
    let self = this;
    myService.getJsonData(url)
      .then(function(data) {
        let jsonData = JSON.parse(data);
        console.log("Hello!");
        console.log(jsonData);
        if (jsonData.ProviderData.InsiderOffer == null) {
          self.noCampaign(jsonData);
        } else {
          self.setData(jsonData);
        }
      })
      .catch(function(err) {
        console.log("There was an error: " + err);
        self.errorScreen();
      })
  }

  componentDidMount() {
    console.log("Mounted");
    setInterval(this.checkButtons, 100);
  }

  render() {
    return (
      <div>
        <div>
          { this.showData ? null : this.errorHTML }
        </div>
        <div>
          { this.loading ? this.loadingHTML : null}
        </div>
        <div className="flexBox">
          <div id="leftBox">
            <div className="insideBox">
              <h2>{this.companyData.companyName}</h2>
              <br/>
              <img src="http://taptobook-dev-guestcheckout.azurewebsites.net/content/images/TTB_trusted_logo.png?v=3.1" alt="TapToBook trusted partner"/>
              <br/><br/><br/>
              <img src={this.companyData.imageLink} alt=""/>
              <br/><br/><br/><br/><br/><br/><br/>
              <h3>Address</h3>
              <p>{this.companyData.address1}<br/>{this.companyData.address2}</p>
            </div>
          </div>
          <div id="centerBox">
            <div className="insideBox">
              <h2 className="center">SPECIAL OFFER</h2><br/>
              {this.companyData.offerHTML}
            </div>
          </div>
          <div id="rightBox">
            <div className="insideBox">
              <h2>Let&#39;s Chat</h2><br/>
              <p className="gray">No waiting around! We’ll send you a text notification as replies come in.</p>
              <form autoComplete="on">
                <div className="centerInsideBox">
                  <input type="text" name="fname" id="fname" placeholder="First Name" /><br/>
                  <input type="text" name="lname" id="lname" placeholder="Last Name" /><br/>
                  <input type="text" name="email" id="email" placeholder="Email" /><br/>
                  <input type="text" name="phone" id="phone" placeholder="Phone Number" />
                </div>
                <br/>
                <input type="checkbox" name="agreement" id="agree" value="agree" />
                <label htmlFor="checkbox" className="agreeLabel">{this.companyData.signupPolicy1}&nbsp;<a href="https://www.google.com" id="privacyPolicyLink">Privacy Policy</a>&nbsp;{this.companyData.signupPolicy2}</label>
                <div className="insideBox centerInsideBox bottomBox" id="submitDiv">
                  <input className="submitButton inactiveButton" id="submit" type="submit" value="Start Chat" />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
