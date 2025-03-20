import React, { useState, useEffect } from "react";


const getLocation = (aoiCenter, radiusAroundAoi) => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if((haversineDistance(position.coords.latitude,position.coords.longitude,aoiCenter[0],aoiCenter[1]) <=( radiusAroundAoi + 0.2)) || radiusAroundAoi === -1){

            const coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };

            if(coordinates.accuracy <= 100){
              resolve({"success":true,"message":coordinates.accuracy, "coordinates": coordinates});
            }else{
              resolve({"false":false, "message": `Please turn on device location for accurate positioning: ${coordinates.accuracy}`});

            }

          }else{
            resolve({"success":false, "message": "You are not in the proximity of your plot"})
          }
        },
        (error) => {
          reject(error);
        }
      );
    } else {
      reject(new Error('Geolocation is not supported by your browser, try updating or changing it'));
    }
  });
};


const  haversineDistance = (lat1, lon1, lat2, lon2) =>{
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const rLat1 = toRadians(lat1);
  const rLat2 = toRadians(lat2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in kilometers
  return distance;
}

const calculateBoundingCircleRadius = (aoiCenter,polygon)=> {
  let maxDistance = 0;
  const center = aoiCenter
  // [0, 0]; // Initialize center at [0, 0]

  // // Calculate centroid (center) of the polygon
  // for (let i = 0; i < polygon.length; i++) {
  //   center[0] += polygon[i][0];
  //   center[1] += polygon[i][1];
  // }
  // center[0] /= polygon.length;
  // center[1] /= polygon.length;

  // Calculate distance from center to each vertex
  for (let i = 0; i < polygon.length; i++) {
    const vertex = polygon[i];
    const distance = haversineDistance(center[0], center[1], vertex[0], vertex[1]);
    maxDistance = Math.max(maxDistance, distance);
  }

  return maxDistance;
}


// const [location, setLocation] = useState({ latitude: null, longitude: null })

// const getLocation = () => {
//   let coords
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         // setLocation({
//         //     latitude: position.coords.latitude,
//         //     longitude: position.coords.longitude,
//         //     accuracy: position.coords.accuracy,
//         // });
//         coords = { latitude: position.coords.latitude, longitude: position.coords.longitude }
//         return coords
//         //     ,

//         //     accuracy: position.coords.accuracy,
//         // }))
//       },
//       (err) => {
//         alert(err.message);
//       },
//       {
//         enableHighAccuracy: true, // Request high accuracy
//         timeout: 10000,           // Timeout after 10 seconds
//         maximumAge: 0,            // No cached location
//       }
//     );
//   } else {19:18
//     alert('Geolocation is not supported by this browser.');
//   }
// }

// const GPSLocator = () => {


//     const watchLocation = () => {
//         if (navigator.geolocation) {
//             navigator.geolocation.watchPosition()
//         }
//     }


// }

export default getLocation;