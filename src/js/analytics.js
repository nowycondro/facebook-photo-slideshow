// const fpsAnalytics = ({eventCategory, eventAction, eventLabel}) => {
//   const v = '1';
//   const dl = window.location.href;
//   const dt = window.document.title;
//   const de = window.document.inputEncoding;
//   const ds = "fps"; // Browser
//   const [ul] = navigator.language;
//   const tid = 'UA-22076179-7';
//   // const cid = 'TODO'; Client ID
//   const sr = `${window.screen.width}x${window.screen.height}`;
//   const sd = `${window.screen.pixelDepth}-bit`;
//   const ec = eventCategory;
//   const ea = eventAction;
//   const el = eventLabel;
//   const t = "event";
//   const z = `${Math.random()}`;
  

//   const request = new XMLHttpRequest();
//   const message = Object.entries({
//     v,
//     dl,
//     dt,
//     de,
//     ds,
//     ul,
//     tid,
//     // cid,
//     sr,
//     sd,
//     ec,
//     ea,
//     t,
//     z
//   }).map(([key, value]) => `${key}=${value}`)
//   .join("&");

//   request.open("GET", `https://www.google-analytics.com/collect?${message}`, true);
//   request.send();

//   console.log(message);
// };