
import axiosInstance from "../../utils/axiosConfig";

const submitQuote = async (formData) => {
    const { email, firstname, lastname, company, phone, hectares, isDemoAccount } = formData;

    try {
        const response = await axiosInstance.post('http://localhost:8000/api/quote/add/', {
            email,
            firstname,
            lastname,
            company,
            phone,
            nb_hectares: hectares,
            demo_account: isDemoAccount,
        });

        if (response.status === 200) {
            return { success: true, message: "Quote saved successfully" };
        } else {
            return { success: false, message: response.data };
        }
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export default submitQuote;
