import React, { useEffect, useState } from "react";
import { Img } from "react-image";
import loading from "../../../assets/images/loading_small.svg";
import { useDispatch, useSelector } from "react-redux";
import { get_task_sidebar_image } from "../../../actions/task";



const TaskImage = ({ taskId }) => {
  const [imageReady, setImageReady] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const dispatch = useDispatch();
  const imageSidebar = useSelector((state) => state.mapReducer.imageSidebarArDetails);

  useEffect(() => {
    let intervalId

    const checkImage = () => {
      if (!imageSidebar) {
        if (attemptCount < 5) {
          dispatch(get_task_sidebar_image(taskId)).then((res) => {
            if (res.status === 200) {
              setImageReady(true);
            }
          }
          )
          setAttemptCount(attemptCount + 1);
        } else {
          // Stop the interval after reaching maxAttempts wichh is 3 min
          clearInterval(intervalId);
        }
      } else {
        setImageReady(true);
      }
    }
    intervalId = setInterval(checkImage, 5000);
    // Initial check
    checkImage()
    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [imageSidebar])

  return (
    <div style={{ maxHeight: "150px" }}>
      {imageReady ?
        <Img
          className="w-100"
          src={`${process.env.REACT_APP_API_URL}${imageSidebar}`}
          alt="Task Image"
          loading="lazy"
          loader={<img src={loading} alt="Loading" />}
          style={{ maxHeight: "150px" }}
        />
        :
        <img src={loading} alt="Loading" />
      }



    </div>
  );
};

export default TaskImage;
