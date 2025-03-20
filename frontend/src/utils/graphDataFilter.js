export const handleFilterData = (data, StartDate, EndtDate) => {
    const filteredData = data.filter(item => {
        const currentDate = new Date(item.date);
        const start = StartDate ? new Date(StartDate) : null;
        const end = EndtDate ? new Date(EndtDate) : null;

        // Check if the current date is between start and end dates
        if (
            (!start || currentDate >= start) &&
            (!end || currentDate <= end)
        ) {
            return true;
        }

        return false;
    });
    return filteredData
}

export const handleFilterDataByCloudPercentage = (data, cloud_percentage) => {
    const filteredData = data.filter(item => {
        return item.cloud_percentage <= cloud_percentage;
    });

    return filteredData;
};

export const findMinMaxValues = (dataFiltred, dataSmoothedFiltred) => {
    // Extract 'value' field from dataFiltred
    const valuesFiltred = dataFiltred.map(item => item.value);

    // Extract 'NDVI_rolling_mean' field from dataSmoothedFiltred
    const ndviValuesSmoothed = dataSmoothedFiltred.map(item => item.NDVI_rolling_mean);

    // Combine both arrays into one
    const allValues = [...valuesFiltred, ...ndviValuesSmoothed];

    // Find min and max values
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    return { minValue, maxValue };
};

export const findMinMaxValuesArray = (dataArr1, dataArr2) => {
    // Extract 'value' field from dataFiltred
    const valuesFiltred1 = dataArr1.map(item => item.value);

    // Extract 'NDVI_rolling_mean' field from dataSmoothedFiltred
    const valuesFiltred2 = dataArr2.map(item => item.value);

    // Combine both arrays into one
    const allValues = [...valuesFiltred1, ...valuesFiltred2];

    // Find min and max values
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);

    return { minValue, maxValue };
};
