import {
    Button, Checkbox,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel, Radio,
    RadioGroup,
    TextField
} from "@mui/material";
import {useContext, useState} from "react";
import {BASE_URL, EXPORT_URL} from "../utils/constants";
import {fetcher} from "../utils/fetch_utils";
import excelIcon from "../images/excel-42-32.png";
import filterIcon from "../images/filter-44-32.png";
import CreateHandlerPlus from "./CreateHandlerPlus";
import {StoreContext} from "../store/store";
import {observer} from "mobx-react";
import {defaultFilters, FILTERS} from "../generated_constants";

function SearchFilterBlock() {
    const store = useContext(StoreContext)
    const {items, dropFilters, filterItems} = store

    const [searchString, setSearchString] = useState("")
    const [filterDialogOpen, setFilterDialogOpen] = useState(false)
    const [olderThanYear, setOlderThanYear] = useState("")
    const [youngerThanYear, setYoungerThanYear] = useState("")
    const [selectedService, setSelectedService] = useState("")
    const [filters, setFilters] = useState(defaultFilters)

    const handleInput = (event) => {
        const searchStr = event.target.value
        setSearchString(searchStr)
        if (!searchStr) {
            dropFilters()
        } else {
            if (searchStr.length > 3) {
                filterItems({search: searchStr})
            }
        }
    }
    const handleExportButton = async () => {
        let item_ids = []
        items.map((i) => item_ids.push(i._id))
        const url = BASE_URL + EXPORT_URL
        const result = await fetcher({
            url, method: "POST", credentials: true,
            payload: {item_ids: item_ids}, asFile: true
        })
        const blobUrl = window.URL.createObjectURL(result)
        const anchor = document.createElement("a")
        anchor.href = blobUrl
        anchor.download = "items.xls"
        anchor.click()
    }
    const handleFilterModalDialog = () => {
        setFilterDialogOpen(true)
    }
    const clearFilters = () => {
        setSelectedService("")
        setOlderThanYear("")
        setYoungerThanYear("")
        setFilters(defaultFilters);
        dropFilters()
        setFilterDialogOpen(false)
    }
    const applyFilters = async () => {
        let filter = {}
        if (youngerThanYear !== "") filter.younger_than = youngerThanYear;
        if (olderThanYear !== "") filter.older_than = olderThanYear;
        if (selectedService !== "") {
            if (selectedService === "noService") {
                filter.noService = true
            } else {
                filter.service = selectedService;
            }
        }

        const category = Object.keys(filters)
            .filter(key => filters[key])
            .map(key => FILTERS[key].value);
        if (category.length > 0) filter.category = category;
        if (Object.entries(filter).length > 0) {
            if (searchString !== "") {
                filter.search = searchString
            }
            filterItems(filter)
        }
        setFilterDialogOpen(false)
    }
    const handleServiceChange = (event) => {
        const service = event.target.value
        if (selectedService === service) {
            setSelectedService("")
        } else {
            setSelectedService(service)
        }
    }
    const handleCategoryChange = (event) => {
        const {name, checked} = event.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: checked
        }));
    };
    const handleOlderInput = (event) => {
        setOlderThanYear(event.target.value)
    }
    const handleYoungerInput = (event) => {
        setYoungerThanYear(event.target.value)
    }
    const validateFilters = () => {
        const filterSelected = Object.values(filters).some(v => v === true)
        return !(youngerThanYear || olderThanYear || selectedService || filterSelected)
    }
    return (
        <div className={"search-handlers"}>
            <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
                <DialogTitle>Налаштування фільтрів</DialogTitle>
                <DialogContent>
                    <div style={{padding: "0 0 15px", display: "flex", gap: "1.5em"}}>
                        <TextField variant="standard"
                                   label="Новіше ніж: "
                                   helperText="...року виготовлення"
                                   value={youngerThanYear}
                                   margin="dense"
                                   onChange={handleYoungerInput}/>
                        <TextField variant="standard"
                                   label="Старіше ніж: "
                                   helperText="...року виготовлення"
                                   value={olderThanYear}
                                   margin="dense"
                                   onChange={handleOlderInput}/>
                    </div>
                    <FormControl variant="filled">
                        <FormLabel style={{fontWeight: 600}}>Фільтрувати за службою</FormLabel>
                        <RadioGroup name="serviceRadioGroup"
                                    onChange={handleServiceChange}>
                            <FormControlLabel
                                control={<Radio checked={selectedService === "VNLZ"} onClick={handleServiceChange}/>}
                                value="VNLZ"
                                label={"Тільки ВНЛЗ"}/>
                            <FormControlLabel
                                control={<Radio checked={selectedService === "SZ"} onClick={handleServiceChange}/>}
                                value="SZ"
                                label="Тільки Служба зв'язку"/>
                            <FormControlLabel
                                control={<Radio checked={selectedService === "noService"}
                                                onClick={handleServiceChange}/>}
                                value="noService"
                                label="Не на обліку"/>
                        </RadioGroup>
                        <FormLabel style={{fontWeight: 600}}>Фільтрувати за категоріями</FormLabel>
                        {Object.keys(FILTERS).map(key => (
                            <FormControlLabel
                                key={key}
                                control={
                                    <Checkbox
                                        checked={filters[key]}
                                        onChange={handleCategoryChange}
                                        name={key}
                                    />
                                }
                                label={FILTERS[key].title}
                            />
                        ))}
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setFilterDialogOpen(false);
                        clearFilters()
                    }}> Cancel </Button>
                    <Button onClick={clearFilters} disabled={validateFilters()}> Clear </Button>
                    <Button variant="contained" color="success" onClick={applyFilters}
                            disabled={validateFilters()}> Apply </Button>
                </DialogActions>

            </Dialog>
            <TextField autoFocus
                       sx={{minWidth: "200px"}}
                       variant="outlined"
                       label="Пошук"
                       color="info"
                       helperText="по назві або по інвентарному номеру, мінімум 4 символи"
                       onChange={handleInput}
            />
            <div>
                <Button variant="contained"
                        color="info"
                        title="Налаштування Фільтрів"
                        onClick={handleFilterModalDialog}>
                    <img src={filterIcon} height={30} alt="" style={{padding: "0 5px"}}/>
                </Button>
            </div>
            <div>
                <Button variant="contained"
                        color="success"
                        title="Зберегти в Excel"
                        disabled={items.length === 0}
                        onClick={handleExportButton}>
                    <img src={excelIcon} height={30} alt="" style={{padding: "0 5px"}}/>
                </Button>
            </div>
            <CreateHandlerPlus/>
        </div>
    )
}

export default observer(SearchFilterBlock)