import "../../src/assets/scss/user.scss";
import React, { useEffect, useState } from "react";
import { GetAllUsers } from "../actions/user";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingData from "../utils/loadingdata";
import DataTable from "react-data-table-component";
import DataTableExtensions from "react-data-table-component-extensions";
import dayjs from "dayjs";
import { Grid } from "@mui/material";


const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [allUsers, setAllUsers] = useState([]);
  const [monthUsers, setMonthUsers] = useState([]);
  const [weekUsers, setWeekUsers] = useState([]);
  const [pending, setPending] = useState(true);
  const [isMonthly, setIsMonthly] = useState(true);



  const rowClicked = (state) => {
    navigate("/dashboard/user/" + state.id);
  };

  const columns = [
    {
      name: "Id",
      selector: (row) => row.id,
      sortable: true,

    },
    {
      name: "FirstName",
      selector: (row) => row.firstname,
      sortable: true,

    },
    {
      name: "LastName",
      selector: (row) => row.lastname,
      sortable: true,

    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,

    },
    {
      name: "Last Login",
      selector: (row) => row.last_login,
      cell: (props) => (
        <span>{dayjs(props.last_login).format("DD-MM-YYYY HH:mm")}</span>
      ),
      sortable: true,

    },
    {
      name: "Demo Account",
      selector: (row) => row.is_not_demo,
      cell: (props) => (
          <input type="checkbox" checked={props.is_not_demo} disabled />
      ),
      sortable: true,

    },
  ];

  const tableData = {
    columns,
    data: allUsers,
    print: false,
    exportHeaders: true,

  };

  const handleSelectChange = (type) => {
    if (type == "month") {
      setAllUsers(monthUsers);
      setIsMonthly(true);
    } else {
      setAllUsers(weekUsers);
      setIsMonthly(false);
    }
  };

  function priorMonday(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
  }

  // Get ranges for filters
  let d = new Date();

  // weekend is yesterday at 00:00:00.000
  let weekend = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

  // weekstart is previous Monday at 00:00:00.000
  let weekstart = priorMonday(weekend);

  useEffect(() => {
    dispatch(GetAllUsers()).then((response) => {
      if (response.status === 200) {
        setPending(false);
        setAllUsers(response.data.data);
        setMonthUsers(response.data.data);
        const weeksArray = response.data.data.filter(
          (element) =>
            new Date(element.last_login) >= weekstart &&
            new Date(element.last_login) <= weekend
        );
        setWeekUsers(weeksArray);
      }
    });
  }, []);

  return (
    <Grid container sx={{ flex: 1 }}>
      <Grid container spacing={2} sx={{ p: 2 }}>
        <Grid item xs={12}>
          <div className="mod-user-history">
            <div className="m-wrapper">
              <div className="m-content row">
                <div className="col-12">
                  <div className="row d-flex justify-content-between">
                    <h3 className="col-sm-12 col-md-6">{t('All Users')}</h3>

                    <div class="col-sm-12 col-md-6 dropdown d-flex justify-content-end">
                      <button
                        class="btn btn-sm btn-outline-success dropdown-toggle d-flex align-items-center gap-1 dropdown-toggle"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <i className="bi bi-calendar3"></i>
                        {isMonthly ? (
                          <span> This Month</span>
                        ) : (
                          <span> This Week</span>
                        )}
                      </button>
                      <ul class="dropdown-menu">
                        <li>
                          <a
                            class="dropdown-item"
                            onClick={() => handleSelectChange("week")}
                          >
                            This week
                          </a>
                        </li>
                        <li>
                          <a
                            class="dropdown-item"
                            onClick={() => handleSelectChange("month")}
                          >
                            This Month
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <DataTableExtensions {...tableData}>
                    <DataTable
                      onRowClicked={rowClicked}
                      columns={columns}
                      data={allUsers}
                      pagination
                      paginationPerPage="10"
                      paginationRowsPerPageOptions={[10, 15, 20, 30, 50, 100]}
                      progressPending={pending}
                      highlightOnHover
                      progressComponent={<LoadingData />}
                    />
                  </DataTableExtensions>
                </div>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Users;
