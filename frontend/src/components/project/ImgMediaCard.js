import React, {useState, useCallback, useMemo, useEffect} from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import "../../assets/scss/mediacard.scss";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import DeleteProject from "../task/delete";
import { useTranslation } from "react-i18next";
import { CardMedia } from "@mui/material";
import Row from "react-bootstrap/esm/Row";

const ImgMediaCard = React.memo(({ element }) => {

  const PLACEHOLDER_IMAGE = `${process.env.REACT_APP_API_URL}/static/placeholder435x435.jpg`;

  const [imgUrl, setImgUrl] = useState(PLACEHOLDER_IMAGE);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { t } = useTranslation();

  const fetchImageUrl = useMemo(() => {
    const imageUrl = `${process.env.REACT_APP_API_URL}/media/covers/${element.id}.png`;
    return fetch(imageUrl, { method: 'HEAD' })
        .then((response) => response.ok ? imageUrl : PLACEHOLDER_IMAGE)
        .catch(() => PLACEHOLDER_IMAGE);
  }, [element.id]);

  useEffect(() => {
    fetchImageUrl.then(setImgUrl);
  }, [fetchImageUrl]);



  const handleOpenDeleteModal = useCallback(() => {
    setDeleteModalOpen(true);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
  }, []);
  return (
      <div className="mod-media-card my-2 py-0">
        <Card>
          <a className="link task-card-img" href={`/task/detail/${element.id}`}>
            <div className="content-overlay"></div>

            <CardMedia
                component="img"
                alt={element.task_name}
                width="100%"
                image={imgUrl}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
            />
            <div className="content-details fadeIn-bottom">
              <h3>{element.task_name}</h3>
              <p>{t("View Map")}</p>
            </div>
          </a>
          <CardContent className="m-content">
            <a className="link" href={`/task/detail/${element.id}`}>
              <Typography
                  gutterBottom
                  variant="h5"
                  className="m-headline task-link"
                  component="div"
              >
                {element.task_name}
              </Typography>
            </a>
            <Row className="mt-3 mb-3">

            <div className="m-description-container col-md-6">
              <p className="m-description">
                <b className="m-title">{t("Surface")}</b>
                <span> {element.surface} </span>
              </p>
              <p className="m-description">
                <b className="m-title">{t("Culture")} </b>
                <span> {element["culture"] && element["culture"].name_fr} </span>
              </p>
              <p className="m-description">
                <b className="m-title">{t("Density")}</b>
                <span>{element["density"] && element["density"].name_fr} </span>
              </p>
              <p className="m-description">
                <b className="m-title">{t("Variety")}</b>
                <span> {element["variety"] && element["variety"].name_fr} </span>
              </p>
            </div>
            <div className="m-description-container col-md-6">

              {element.intensification_culture && (
                  <p className="m-description">
                    <b className="m-title">{t("Culture 2")}</b>
                    <span> {element.intensification_culture.name_fr} </span>
                  </p>
              )}
              {element.intensification_variety && (
                  <p className="m-description">
                    <b className="m-title">{t("Variety 2")}</b>
                    <span> {element.intensification_variety.name_fr} </span>
                  </p>
              )}
              {element.intensification_density && (
                  <p className="m-description">
                    <b className="m-title">{t("Density 2")}</b>
                    <span> {element.intensification_density.name_fr} </span>
                  </p>
              )}
            </div>
            </Row>
          </CardContent>
          <CardActions>
            <Button
                size="small"
                startIcon={<DeleteIcon />}
                color="error"
                className="text-capitalize fw-bold"
                onClick={handleOpenDeleteModal}
            >
              {t("Delete")}
            </Button>
            <a href={`/task/detail/${element.id}`}>
              <Button
                  size="small"
                  startIcon={<InfoIcon />}
                  className="text-capitalize fw-bold"
              >
                {t("View details")}
              </Button>
            </a>
          </CardActions>

          <DeleteProject
              open={deleteModalOpen}
              id_task={element.id}
              handleClose={handleCloseDeleteModal}
          />
        </Card>
      </div>
  );
});

export default ImgMediaCard;
