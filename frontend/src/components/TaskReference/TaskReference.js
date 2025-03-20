import React, { useState, useEffect } from "react";
import {
    Grid,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Typography,
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    ListSubheader,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import cookies from "js-cookie";
import { getCulture, getDensity, getVariety, getTaskAge, getCultureByCategory } from "../../actions/project.js";
import {
    getFiltredTasks,
    saveComparePatternReference,
    ListComparePatternReference,
    deleteComparePatternReference,
    getComparePatternReferenceDetails,
    updateComparePatternReference
} from "../../actions/compare.js";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { hideSnackbar, showSnackbar } from "../../actions/snackbar";
import DataTable from "react-data-table-component";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const TaskReference = () => {
    const [categories, setCategories] = useState([]);
    const [listDensityP, setlistDensityP] = useState(null);
    const [listVarietyP, setlistVarietyP] = useState(null);
    const [listTasks, setlistTasks] = useState([]);
    const [loadingP, setloadingP] = useState(false);
    const [listReference, setListReference] = useState([]);
    const langue = cookies.get("i18next") || "en";
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [minAge, setMinAge] = useState(null);
    const [maxAge, setMaxAge] = useState(null);
    const [filters, setFilters] = useState({
        taskName: '',
        culture: '',
        density: '',
        variety: '',
    });
    const [formDataPattern, setFormDataPattern] = useState({
        culture: null,
        density: null,
        variety: null,
        task: null,
        startage: 0,
        endage: "",
    });

    const { t } = useTranslation();
    const currentLanguageCode = cookies.get("i18next") || "en";
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getCultureByCategory(langue)).then((res) => {
            if (res.data && Array.isArray(res.data)) {
                setCategories(res.data);
            }
        });
    }, [langue, dispatch]);

    useEffect(() => {
        dispatch(ListComparePatternReference()).then((res) => {
            const referenceData = res.data?.data || [];
            setListReference(Array.isArray(referenceData) ? referenceData : []);
        });
    }, [dispatch]);

    useEffect(() => {
        if (!formDataPattern.culture) {
            setlistDensityP(null);
            setlistVarietyP(null);
            return;
        }
        dispatch(getVariety(formDataPattern.culture)).then((res) => {
            setlistVarietyP(res.data);
        });
        dispatch(getDensity(formDataPattern.culture)).then((res) => {
            setlistDensityP(res.data);
        });
    }, [formDataPattern.culture, dispatch]);

    useEffect(() => {
        if (formDataPattern.culture && formDataPattern.density && formDataPattern.variety) {
            dispatch(getFiltredTasks(formDataPattern.culture, formDataPattern.variety, formDataPattern.density)).then((res) => {
                setlistTasks(res);
            });
        } else {
            setlistTasks([]);
        }
    }, [dispatch, formDataPattern.culture, formDataPattern.density, formDataPattern.variety]);

    const onChangeCulture = (e) => {
        setFormDataPattern({
            ...formDataPattern,
            culture: e.target.value,
            density: null,
            variety: null,
            task: null,
            startage: 0,
            endage: ""
        });
    };

    const onChangeDensityP = (e) => {
        setFormDataPattern({
            ...formDataPattern,
            density: e.target.value,
            task: null,
            startage: 0,
            endage: ""
        });
    };

    const onChangeVarietyP = (e) => {
        setFormDataPattern({
            ...formDataPattern,
            variety: e.target.value,
            task: null,
            startage: 0,
            endage: ""
        });
    };

    const onChangeTaskPattern = (e) => {
        const taskId = e.target.value;
        setFormDataPattern(prev => ({ ...prev, task: taskId }));

        if (taskId) {
            dispatch(getTaskAge(taskId)).then((res) => {
                if (res && res.age_years) {
                    const minStartAge = Math.max(0, res.age_years - 7);
                    setMinAge(minStartAge);
                    setMaxAge(res.age_years);
                    setFormDataPattern(prev => ({
                        ...prev,
                        task: taskId,
                        startage: minStartAge,
                        endage: res.age_years,
                    }));
                }
            });
        }
    };

    const onChangePattern = (e) => {
        const { name, value } = e.target;
        let updatedValue = value;

        if (name === "startage" || name === "endage") {
            updatedValue = value === "" ? "" : parseInt(value, 10);
        }

        setFormDataPattern(prev => ({ ...prev, [name]: updatedValue }));
    };

    const onSubmitPattern = (e) => {
        e.preventDefault();

        if (formDataPattern.startage > formDataPattern.endage) {
            dispatch(showSnackbar(
                "error",
                undefined,
                t("Start age cannot be greater than end age"),
                "top",
                "right"
            ));
            setTimeout(() => {
                dispatch(hideSnackbar());
            }, 3000);
            return;
        }

        const dataToSubmit = {
            ...formDataPattern,
            endage: formDataPattern.endage === "" ? null : formDataPattern.endage
        };

        dispatch(saveComparePatternReference(dataToSubmit)).then((res) => {
            if (res.status === 200) {
                dispatch(showSnackbar(
                    "success",
                    undefined,
                    t("Task reference saved successfully"),
                    "top",
                    "right"
                ));

                setTimeout(() => {
                    dispatch(hideSnackbar());
                }, 3000);
                dispatch(ListComparePatternReference()).then((res) => {
                    const referenceData = res.data?.data || [];
                    setListReference(Array.isArray(referenceData) ? referenceData : []);
                });
            } else {
                dispatch(showSnackbar(
                    "error",
                    undefined,
                    res.data.error,
                    "top",
                    "right"
                ));
                setTimeout(() => {
                    dispatch(hideSnackbar());
                }, 3000);
            }
        });
    };
    const filteredItems = listReference.filter(item => {
        const searchText = filterText.toLowerCase();
        return (
            item.task?.task_name.toLowerCase().includes(searchText) ||
            item.culture?.name_en.toLowerCase().includes(searchText) ||
            item.density?.name_en.toLowerCase().includes(searchText) ||
            item.variety?.name_en.toLowerCase().includes(searchText) ||
            item.startage.toString().includes(searchText) ||
            (item.endage && item.endage.toString().includes(searchText))
        );
    });

    const handleFilterChange = (e) => {
        setFilterText(e.target.value);
    };

    const handleEdit = (row) => {
        dispatch(getComparePatternReferenceDetails(row.id)).then((res) => {
            setEditingItem(res);
            setEditDialogOpen(true);
        });
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setEditingItem(null);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const { id, startage, endage } = editingItem;
        dispatch(updateComparePatternReference(id, startage, endage)).then((res) => {
            if (res.status === 200) {
                dispatch(showSnackbar(
                    "success",
                    undefined,
                    t("Task reference updated successfully"),
                    "top",
                    "right"
                ));
                setEditDialogOpen(false);
                dispatch(ListComparePatternReference()).then((res) => {
                    const referenceData = res.data?.data || [];
                    setListReference(Array.isArray(referenceData) ? referenceData : []);
                });
            } else {
                dispatch(showSnackbar(
                    "error",
                    undefined,
                    res.data?.error || "An error occurred while updating",
                    "top",
                    "right"
                ));
            }
            setTimeout(() => {
                dispatch(hideSnackbar());
            }, 3000);
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingItem(prev => ({ ...prev, [name]: value }));
    };

    const handleDeleteClick = (row) => {
        setItemToDelete(row);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (itemToDelete) {
            dispatch(deleteComparePatternReference(itemToDelete.id)).then((res) => {
                if (res.status === 200) {
                    dispatch(showSnackbar(
                        "success",
                        undefined,
                        t("Task reference deleted successfully"),
                        "top",
                        "right"
                    ));

                    setTimeout(() => {
                        dispatch(hideSnackbar());
                    }, 3000);

                    dispatch(ListComparePatternReference()).then((res) => {
                        const referenceData = res.data?.data || [];
                        setListReference(Array.isArray(referenceData) ? referenceData : []);
                    });
                }
            });
        }
        setDeleteConfirmOpen(false);
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
    };

    const columns = [
        {
            name: t("Field Reference Name"),
            selector: row => row.task?.task_name || '',
            sortable: true,
        },
        {
            name: t("Culture"),
            selector: row => row.culture?.name_en || '',
            sortable: true,
        },
        {
            name: t("Density"),
            selector: row => row.density?.name_en || '',
            sortable: true,
        },
        {
            name: t("Variety"),
            selector: row => row.variety?.name_en || '',
            sortable: true,
        },
        {
            name: t("Start Age"),
            selector: row => row.startage,
            sortable: true,
        },
        {
            name: t("End Age"),
            selector: row => row.endage,
            sortable: true,
        },
        {
            name: t("Edit"),
            cell: row => <Button startIcon={<EditIcon />} onClick={() => handleEdit(row)}>{t('Edit')}</Button>,
        },
        {
            name: t("Delete"),
            cell: row => <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(row)}>{t('Delete')}</Button>,
        },
    ];

    const renderCultureOptions = () => {
        const menuItems = [];

        if (categories && categories.length > 0) {
            categories.forEach(category => {
                if (category.name && category.cultures && category.cultures.length > 0) {
                    menuItems.push(
                        <ListSubheader
                            key={category.id}
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                backgroundColor: '#f0f0f0',
                                color: 'black'
                            }}
                        >
                            {category.name}
                        </ListSubheader>
                    );

                    category.cultures.forEach(culture => {
                        menuItems.push(
                            <MenuItem
                                key={culture.id}
                                value={culture.id}
                                sx={{ pl: 3, color: 'gray' }}
                            >
                                {culture[`name_${currentLanguageCode.toLowerCase()}`] || culture.name}
                            </MenuItem>
                        );
                    });
                }
            });
        }

        return menuItems;
    };

    return (
        <Box sx={{ flexGrow: 1, bgcolor: "AppBarBackground.main", mt: 3, p: 5 }}>
            <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
                <Grid item xs={12}>
                    <Typography variant="h5" component="h2">
                        {t("Pattern reference comparison")}
                    </Typography>
                </Grid>
            </Grid>
            <form onSubmit={(e) => onSubmitPattern(e)}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl required sx={{ minWidth: "100%" }} size="small">
                            <InputLabel id="culture-label">{t("Culture")}</InputLabel>
                            <Select
                                labelId="culture-label"
                                value={formDataPattern.culture}
                                label="Culture"
                                onChange={onChangeCulture}
                                name="culture"
                                required
                            >
                                {renderCultureOptions()}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl sx={{ minWidth: "100%" }} size="small">
                            <InputLabel id="density-label">{t("Density")}</InputLabel>
                            <Select
                                labelId="density-label"
                                value={formDataPattern.density}
                                onChange={onChangeDensityP}
                                required
                            >
                                {listDensityP?.map((density) => (
                                    <MenuItem key={density.id} value={density.id}>
                                        {density[`name_${currentLanguageCode.toLowerCase()}`]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Rest of the component remains the same */}
                    <Grid item xs={6}>
                        <FormControl sx={{ minWidth: "100%" }} size="small">
                            <InputLabel id="variety-label">{t("Variety")}</InputLabel>
                            <Select
                                labelId="variety-label"
                                value={formDataPattern.variety}
                                onChange={onChangeVarietyP}
                                required
                            >
                                {listVarietyP?.map((variety) => (
                                    <MenuItem key={variety.id} value={variety.id}>
                                        {variety[`name_${currentLanguageCode.toLowerCase()}`]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <FormControl required sx={{ minWidth: "100%" }} size="small">
                            <InputLabel id="task-label">{t("Field")}</InputLabel>
                            <Select
                                labelId="task-label"
                                value={formDataPattern.task}
                                label="Task"
                                onChange={onChangeTaskPattern}
                                name="taskPattern"
                                required
                            >
                                {listTasks?.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.task_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={6}>
                        <TextField
                            label={t("Start Age")}
                            type="number"
                            value={formDataPattern.startage}
                            name="startage"
                            onChange={onChangePattern}
                            inputProps={{
                                min: minAge || 0,
                                max: maxAge ? maxAge - 1 : undefined
                            }}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label={t("End Age")}
                            type="number"
                            value={formDataPattern.endage}
                            name="endage"
                            onChange={onChangePattern}
                            inputProps={{
                                min: minAge ? minAge + 1 : 1,
                                max: maxAge || undefined
                            }}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} container sx={{ justifyContent: "center" }}>
                        <LoadingButton
                            size="small"
                            color="primary"
                            type="submit"
                            loading={loadingP}
                            loadingPosition="start"
                            startIcon={<SaveIcon />}
                            variant="contained"
                        >
                            <span>{t("Save")}</span>
                        </LoadingButton>
                    </Grid>
                </Grid>
            </form>

            <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                <Grid item xs={12}>
                    <Typography variant="h6" component="h3">
                        {t('Reference field')}
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        placeholder={t("Search")}
                        value={filterText}
                        onChange={handleFilterChange}
                        sx={{ marginBottom: '10px' }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <DataTable
                        columns={columns}
                        data={filteredItems}
                        pagination
                        paginationResetDefaultPage={resetPaginationToggle}
                    />
                </Grid>
            </Grid>

            <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
                <DialogTitle>{t("Edit Field Reference")}</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleEditSubmit}>
                        <Grid container spacing={2} style={{ marginTop: '10px' }}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label={t("Start Age")}
                                    type="number"
                                    name="startage"
                                    value={editingItem?.startage !== null && editingItem?.startage !== undefined ? editingItem.startage : ''}
                                    onChange={handleEditChange}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label={t("End Age")}
                                    type="number"
                                    name="endage"
                                    value={editingItem?.endage !== null && editingItem?.endage !== undefined ? editingItem.endage : ''}
                                    onChange={handleEditChange}
                                />
                            </Grid>
                        </Grid>
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditDialogClose}>{t("Cancel")}</Button>
                    <Button onClick={handleEditSubmit} color="primary">
                        {t("Save")}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteConfirmOpen}
                onClose={handleDeleteCancel}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {t("Confirm Deletion")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t("Are you sure you want to delete this task reference?")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>{t("Cancel")}</Button>
                    <Button onClick={handleDeleteConfirm} autoFocus>
                        {t("Delete")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TaskReference;
