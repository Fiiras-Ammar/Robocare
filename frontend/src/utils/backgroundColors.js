export const getPieRandomColor = (usedColors) => {
    const colors = [
        '#C3E2C2', '#EAECCC', '#DBCC95', '#CD8D7A', '#9BB8CD',
        '#FFF7D4', '#EEC759', '#B1C381', '#61A3BA', '#FFFFDD',
        '#D2DE32', '#A2C579', '#DBCC95', '#ECF4D6', '#9AD0C2',
        '#2D9596', '#265073', '#CD5C08', '#F5E8B7', '#C1D8C3',
        '#6A9C89', '#D6D46D', '#F4DFB6', '#DE8F5F', '#9A4444',
        '#016A70', '#FFFFDD', '#FFD9B7', '#9ED2BE', '#FFC6AC',
        '#C4C1A4', '#9E9FA5'
    ];

    const availableColors = colors.filter(color => !usedColors.includes(color));
    if (availableColors.length === 0) {
        // If all colors have been used, reset the usedColors array
        usedColors.length = 0;
    }
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    const selectedColor = availableColors[randomIndex];
    usedColors.push(selectedColor);
    return selectedColor;
};

export const getRandomColor = (usedColors) => {
    const colors = [
        '#C3E2C2', '#EAECCC', '#DBCC95', '#CD8D7A', '#9BB8CD',
        '#FFF7D4', '#EEC759', '#B1C381', '#61A3BA', '#FFFFDD',
        '#D2DE32', '#A2C579', '#DBCC95', '#ECF4D6', '#9AD0C2',
        '#2D9596', '#265073', '#CD5C08', '#F5E8B7', '#C1D8C3',
        '#6A9C89', '#D6D46D', '#F4DFB6', '#DE8F5F', '#9A4444',
        '#016A70', '#FFFFDD', '#FFD9B7', '#9ED2BE', '#FFC6AC',
        '#C4C1A4', '#9E9FA5'
    ];

    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};