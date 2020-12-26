import React, { useState, useEffect, useContext } from 'react';
import { FirebaseConsumer } from "../../context/FirebaseProvider";

function Page(props) {
  const timeNow = Date.now().toString();
  const [deviceMotionDetection, setDeviceMotionDetection] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(timeNow);
  const [orientation, setLocalOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  })
  const pageId = props.match.params.pageId;
  const { fireStore, setPageActive, setOrientation } = useContext(FirebaseConsumer);

  // Page Load
  useEffect(() => {
    if ( !fireStore.pageActive ) {
      setPageActive(pageId);
    }
  }, [fireStore.pageActive, setPageActive, pageId]);


  useEffect(() => {
    if ( deviceMotionDetection ) {
      if ( timeNow - lastUpdate > 1000 ) {
        setOrientation(pageId, orientation);
        setLastUpdate(timeNow);
      }
    }
  }, [deviceMotionDetection, setOrientation, pageId, orientation, lastUpdate, setLastUpdate, timeNow]);

  const acceptDeviceMotion = () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          setDeviceMotionDetection(true);
          if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', handleOrientation, false);
          } else  { 
            alert('no device');
          }
        }
      })
      .catch(console.error)
    } else {
      if (window.DeviceOrientationEvent) {
        setDeviceMotionDetection(true);
        window.addEventListener('deviceorientation', handleOrientation, false);
      } else  { 
        alert('no device');
      }
    }
  };

  const handleOrientation = event => {
    let { alpha, beta, gamma } = event;
    alpha = (Math.round(alpha) + 90)
    beta = (Math.round(beta) + 90)
    gamma = (Math.round(gamma) + 90)
    setLocalOrientation({alpha, beta, gamma})
  }

  return deviceMotionDetection ? (
    <div>
      <div style={{position: 'absolute', color: 'white', marginLeft: '1em'}}>
        <p><strong>Device orientation</strong></p>
        <p>{`alpha: ${orientation.alpha}`}</p>
        <p>{`beta: ${orientation.beta}`}</p>
        <p>{`gamma: ${orientation.gamma}`}</p>
      </div>
    </div>
  ) : (
    <div style={{textAlign: 'center'}}>
      <h1>Instructions</h1>
      <p>To use this you must allow motion detection on your phone</p>
      <button style={{fontSize: '24px' }} onClick={acceptDeviceMotion}>{!deviceMotionDetection ? 'Allow Motion Detection' : 'Motion Accepted'}</button>
    </div>
  );
}

export default Page;