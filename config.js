define([], function() {
  return {
    credits: {
      // You can customize following settings if you've provided valid license key.
      // Otherwise they are ignored.

      // enabled: true,
      // text: "",
      // url: "",
      // logoSrc: "",

      licenseKey: ""
    },

    localization: {
      // inputLocale: "",
      // outputLocale: "",
      // inputDateTimeFormat: "",
      // outputDateFormat: "",
      // outputDateTimeFormat: "",
      // outputTimeFormat: "",
      // outputTimezone: ""
    },

    // defaultTheme: "darkTurquoise",

    settings: {
      // These values affect initial hypercube width and height.
      // maxDimensions * maxMeasures should be <= 10000
      maxDimensions: 5,
      maxMeasures: 15
    }
  };
});
