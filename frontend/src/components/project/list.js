
import React, { useEffect, useState } from 'react'
import Container from 'react-bootstrap/esm/Container'
import Row from 'react-bootstrap/esm/Row'
import { Box, Card } from '@mui/material';
import DataTable from 'react-data-table-component'
import { useDispatch, useSelector } from 'react-redux';
import { listProject } from '../../actions/project';
import { useNavigate } from 'react-router-dom';
import Loading from '../../utils/loading';
import LoadingData from '../../utils/loadingdata';
import { loadingBegin, loadingEnd } from '../../actions/map';
import { ReportDownload } from "../../utils/icons";

import { MdOutlineAddLocationAlt } from "react-icons/md";
import { IoIosAdd } from "react-icons/io";
import CustomButton from '../CustomButton';
import { TbMapSearch } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";
import AddProject from './add';
import DeleteProject from '../task/delete';
import AddTaskPopup from '../task/addPopup';
import { useTranslation } from 'react-i18next';

const ListProject = ({ }) => {
    const openPDFFile = () => {
        // Specify the path to your local PDF file
        const filePath = "http://vps.robocare.tn:8000/static/app/files/jarraya.pdf";

        // Open the file in a new window/tab
        window.open(filePath, '_blank');
    };
    const columns = [
        {
            name: 'Project',
            selector: row => row.project_name,
        },
        {
            name: 'Number of Fields',
            selector: row => row.nbr_field,
        },

        {
            name: 'Created Date',
            selector: row => row.created,
        },
        {
            name: 'surface',
            selector: row => `${row.surface} Ha`,
        },
        {
            name: 'Actions',
            cell: row => (
                <div style={{ justifyContent: "space-between", display: "flex", width: "100%" }}>
                    {/* <CustomButton size="small" color='IconColor' startIcon={<MdOutlineAddLocationAlt fontsize={"20px"} />} onClick={() => handleAddField(row.id, row.project_name)} > */}
                    <CustomButton size="small" color='IconColor' startIcon={<MdOutlineAddLocationAlt fontsize={"20px"} />} onClick={() => handleOpenAddTaskModal(row.id, row.project_name)} >
                        Create Field
                    </CustomButton>
                    {row.project_name === 'Jarraya' ?
                        <CustomButton variant="outlined" size="small" color='DownloadReport' startIcon={<ReportDownload fontsize={"20px"} />} onClick={() => openPDFFile()}>
                            Download report
                        </CustomButton> : ""}
                </div>
            ),
            minWidth: "30%"
        },
    ]

    const columnsTask = [
        {

            selector: row => row.task_name,
        },
        {

            selector: row => `${row.surface} Ha`,
        },
        {

            cell: row => (
                <div className='w-100 d-flex justify-content-evenly'>
                    <CustomButton size="small" color='ViewTask' startIcon={<TbMapSearch />} onClick={() => handleDetailField(row.id)} >
                        View Field
                    </CustomButton>
                    <CustomButton size="small" color='DeleteTask' startIcon={<AiOutlineDelete />} onClick={() => handleOpenDeleteModal(row.id)} >
                        Delete Field
                    </CustomButton>
                </div>
            ),

        },
    ]
    const customStyleProject = {
        rows: {
            style: {
                // override the row height
            },
        },
        headCells: {
            style: {
                fontSize: '18px',
                fontWeight: '600',
            },
        },
        cells: {
            style: {
                fontSize: '13px',
            },
        },
    };
    const customStyleTask = {
        rows: {
            style: {
                paddingLeft: '40px', // override the cell padding for head cells
                paddingRight: '40px', // override the cell padding for head cells

            },
        },
    };

    const [data, setdata] = useState([])
    const [pending, setpending] = useState(true)
    const [addModalOpen, setaddModalOpen] = useState(false);
    const [deleteModalOpen, setdeleteModalOpen] = useState(false);
    const [modalOpenAddTask, setmodalOpenAddTask] = useState(false);
    const [taskId, settaskId] = useState(null)
    const [projectId, setprojectId] = useState(null)
    const [projectName, setprojectName] = useState(null)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [Userid, setUserid] = useState(null)
    useEffect(() => {
        dispatch(loadingBegin(1))
    }, [])
    useEffect(() => {
        setTimeout(() => dispatch(loadingEnd(0))
            , 500)
    }, [])
    const handleAddField = (id_project, project_name) => {
        navigate(`/dashboard/task/add/${project_name}/${id_project}`)
    }
    const handleDetailField = (id_task) => {
        navigate(`/task/detail/${id_task}`)
    }

    const user = useSelector(state => state.auth.user);
    useEffect(() => {
        if (!user) return;
        setUserid(user.id)

    })
    useEffect(() => {
        if (!user) return;
        dispatch(listProject(Userid)).then(res => {
            if (res.status === 200) {
                const modifiedData = res.data.data.map((item, index) => ({
                    ...item,
                    defaultExpanded: item.tasks.length > 0 // Add defaultExpanded field with value true only with non-empty tasks array
                }));
                const timeout = setTimeout(() => {
                    setdata(modifiedData)
                    setpending(false);
                }, 2000);
                return () => clearTimeout(timeout);
            } else {

            }
        }).catch(error => {
        })
    }, [Userid])
    const handleOpenaddModal = () => {
        setaddModalOpen(true)
    }
    const handleCloseAddModal = () => {
        setaddModalOpen(false);
    };
    const handleOpenDeleteModal = (id_task) => {
        settaskId(id_task)
        setdeleteModalOpen(true)

    }
    const handleCloseDeleteModal = () => {
        setdeleteModalOpen(false);
    };
    const handleOpenAddTaskModal = (id_project, project_name) => {
        setprojectId(id_project)
        setprojectName(project_name)
        setmodalOpenAddTask(true)

    }
    const handleCloseAddTaskModal = () => {
        setmodalOpenAddTask(false);
    };
    const ExpandableRowComponent = ({ data }) => {
        if (data.tasks.length === 0) {
            return (
                <>
                    {/* <div className='container'>
                        <div className='row mb-2 mt-2 text-center'>
                            <div className='col-md-12'>
                                <Button variant="contained" color='IconColor' startIcon={<AddPolygonField />} onClick={() => handleAddField(data.id, data.project_name)} >
                                    Create Field
                                </Button>
                            </div>
                        </div>
                    </div> */}
                    <div className='container'>
                        <div className='row mb-2 mt-2 text-center'>
                            <div className='col-md-12'></div>
                            <span>Empty..</span>
                        </div>
                    </div>

                </>
            )
        } else {
            return (
                <>
                    <DataTable
                        columns={columnsTask}
                        data={data.tasks}
                        noTableHead={true}
                        customStyles={customStyleTask}

                    />
                </>
            )
        }


    };
    return (
        <Card>
            <Container>
                <Row className='mt-5'>
                    <div className='col-md-12'>
                        <div className="intro-text">
                            <h2>{t('Projects and Tasks Management')}</h2>
                            {/* <p>
                                This page allows you to view and manage your projects and associated tasks. Below is a table displaying the projects and their respective information.
                                You can expand the rows to view the tasks associated with each project. Use the pagination controls to navigate through the projects.
                            </p> */}
                        </div>
                    </div>
                </Row>
                <Row>
                    <div className='col-md-12'>
                        <CustomButton color='IconColor' size="medium" startIcon={<IoIosAdd />} onClick={handleOpenaddModal}>
                            Create project
                        </CustomButton>
                    </div>
                </Row>
                <Row className='mt-3'>
                    <Loading />
                    <div className='col-md-12' >
                        <Box sx={{ width: '100%' }}>
                            <DataTable
                                columns={columns}
                                data={data}
                                pagination
                                paginationPerPage="10"
                                paginationRowsPerPageOptions={[10, 15, 20, 30, 50, 100]}
                                expandableRows
                                expandableRowExpanded={row => row.defaultExpanded}
                                expandableRowsComponent={ExpandableRowComponent}
                                progressPending={pending}
                                progressComponent={<LoadingData />}
                                customStyles={customStyleProject}

                            />
                        </Box>
                    </div>
                </Row>
            </Container>
            <AddProject open={addModalOpen} handleClose={handleCloseAddModal} />
            <DeleteProject open={deleteModalOpen} id_task={taskId} handleClose={handleCloseDeleteModal} />
            <AddTaskPopup open={modalOpenAddTask} id_project={projectId} project_name={projectName} handleClose={handleCloseAddTaskModal} />

        </Card>
    )
}

export default ListProject
