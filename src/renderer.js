// const setButton = document.getElementById('btn');
// const query = document.getElementById('qry');
// const results = document.getElementById('results');

// setButton.addEventListener("click", () => {
//   window.api.receive("fromMain", (data) => {
//     console.log({data});
//     for(var i = 0; i < data.length; i++) {
//       let p = document.createElement("p")
//       var group = [data[i].nominal_date, data[i].location]
//       var eqp = data[i].equipment;
//       if (eqp !== 'Unknown') {
//         group.push(eqp);
//       }
//       var str = group.join(", ") + " (" + data[i].media_type + ")";
//       results.append(str, p);
//     }
//   });
//   window.api.send("toMain", "some data");

//   window.api.receive("sendFiles", (data) => {
//     console.log({data});
//   });
//   window.api.send("getFiles", ['2014-02-20', 'PS A', 'gopro']);
// })



// query.addEventListener("click", () => {
//   window.api.receive("sendFiles", (data) => {
//     console.log({data});
//   });
//   window.api.send("getFiles", ['2014-02-20', 'PS B', 'gopro']);
// })

// console.log("renderer.js");