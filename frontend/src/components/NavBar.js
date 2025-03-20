import React, { useEffect, useState } from "react";
import { useDispatch, useSelector} from "react-redux";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import logo from "../assets/images/LOGO ROBOCARE.png";
import { useNavigate } from "react-router-dom";
import { logout } from "../actions/auth";
import "../assets/css/Navbar.css";
import Offcanvas from "react-bootstrap/Offcanvas";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import cookies from "js-cookie";
import classNames from "classnames";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUser } from "react-icons/fa";
import Language from "../utils/Language";

const NavbarDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [isLogout, setisLogout] = useState(false);
  const [username, setusername] = useState(null);
  const navigate = useNavigate();

  //function logout_event() {
  //props.logout();
  //setisLogout(true);
  //}
  function logout_event() {
    dispatch(logout());
    setisLogout(true);
  }
  useEffect(() => {
    if (!user) return;
    const username = user.firstname + " " + user.lastname;
    setusername(username);
  }, [user]);
  const { t } = useTranslation();

  const handleNavigateToProfile = () => {
    navigate("/dashboard/profile");
  };
  return (
      <Navbar
          className="nav-dashboard"
          expand="md"
          style={{ padding: "0px 20px" }}
      >
        {/* <Container>
        <div className='row' style={{width:"100%",margin:"auto"}}> */}
        {/* <div className='col-md-2 col-9'>     */}
        <Navbar.Brand
            href="/"
            style={{
              textAlign: "center",
              maxHeight: "-webkit-fill-available",
              display: "contents",
            }}
        >
          <img
              src={logo}
              alt="logo"
              style={{
                maxHeight: window.innerWidth <= 768 ? "60px" : "-webkit-fill-available",
                minWidth: window.innerWidth <= 768 ? "150px" : "auto",
                maxWidth: window.innerWidth <= 768 ? "250px" : "auto",
              }}

          />
        </Navbar.Brand>
        {/* </div> */}
        {/* <Navbar.Toggle aria-controls="navbarScroll"  /> */}

        {/* <div className='col-md-10 col-6 align-self-center'> */}
        <Navbar.Toggle aria-controls="offcanvasNavbar-expand" />
        {[false].map((expand) => (
            <Navbar.Offcanvas
                id={`offcanvasNavbar-expand-${expand}`}
                aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
                placement="end"
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  <Navbar.Brand href="/" style={{ textAlign: "center" }}>
                    <img src={logo} style={{ height: "80px" }} alt="logo" />
                  </Navbar.Brand>
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-start flex-grow-1 pe-3">
                  <Nav.Link href="/dashboard">{t("Dashboard")}</Nav.Link>
                  <Nav.Link href="/dashboard/projects/list">
                    {t("Projects")}
                  </Nav.Link>
                  {/* <Nav.Link href="#action1">Pricing</Nav.Link>
              <Nav.Link href="#action2">Reports</Nav.Link> */}
                </Nav>

                <div className="language-select" style={{ alignSelf: "center" }}>
                  <div className="d-flex justify-content-end align-items-center language-select-root"></div>
                  <Language color="#FFFFFF" />
                </div>
                <Navbar.Text>
                  {username && (
                      <NavDropdown
                          title={username}
                          id="navbarScrollingDropdown"
                          drop="down-centered"
                          className="user-dropdown"
                      >
                        <NavDropdown.Item
                            className=" navbar-dropdown-item d-flex align-items-center "
                            onClick={handleNavigateToProfile}
                        >
                          <FaUser style={{ marginRight: "5px", width: "20px" }} />
                          {t("Profile")}
                        </NavDropdown.Item>
                        <NavDropdown.Item
                            className=" navbar-dropdown-item d-flex align-items-center "
                            onClick={logout_event}
                        >
                          <HiOutlineLogout
                              style={{ marginRight: "5px", width: "20px" }}
                          />
                          {t("Logout")}
                        </NavDropdown.Item>
                      </NavDropdown>
                  )}
                </Navbar.Text>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
        ))}
        {/* <Navbar id="navbarScroll"> */}
        {/* <Nav
    className="me-auto my-2 my-lg-0"
    style={{ maxHeight: '100px' }}
    navbarScroll
  >
    <Nav.Link href="/dashboard">Dashboard</Nav.Link>
    <Nav.Link href="/dashboard/projects/list">Projects</Nav.Link>
    <Nav.Link href="#action1">Pricing</Nav.Link>
    <Nav.Link href="#action2">Reports</Nav.Link> */}
        {/* <NavDropdown title="Link" id="navbarScrollingDropdown">
              <NavDropdown.Item href="#action3">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action4">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action5">
                Something else here
              </NavDropdown.Item>
            </NavDropdown> */}
        {/* </Nav> */}

        {/* {username && (
    <Navbar.Text>
      <NavDropdown title={username} id="navbarScrollingDropdown" drop="down-centered" className="user-dropdown">
        <NavDropdown.Item className="text-center" onClick={logout_event}>
          Logout
        </NavDropdown.Item>
      </NavDropdown>
    </Navbar.Text>
  )}
</Navbar> */}
        {/* </div> */}

        {/* </div>
      </Container> */}
      </Navbar>
  );
};

export default NavbarDashboard;

