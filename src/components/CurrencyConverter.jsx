import React, { useEffect, useState } from "react";
import Currencydropdown from "./dropdown";
import { HiArrowsRightLeft } from "react-icons/hi2";

const CurrencyConverter = () => {
    const [currencies, setCurrencies] = useState([]);
    const [amount, setAmount] = useState(1);

    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("USD");

    const [convertedAmount, setConvertedAmount] = useState(null);
    const [converting, setConverting] = useState(null);

    const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem("favorites")) || ["INR","EUR"]);

    const fetchCurrencies = async() => {
        try {
            const res = await fetch("https://api.frankfurter.dev/v1/currencies");
            const data = await res.json();

            setCurrencies(Object.keys(data));
        } catch (error) {
            console.error("Error Fetching", error);
        }
    };

    useEffect( () => {
        fetchCurrencies();
    }, [])

    console.log(currencies)

    const currencyConvert = async () => {
        if (!amount || isNaN(amount)) return; // Ensure valid input
        setConverting(true);
    
        try {
            const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${fromCurrency}&symbols=${toCurrency}`);
            const data = await res.json();
    
            if (!data.rates || !data.rates[toCurrency]) {
                throw new Error("Invalid currency conversion data.");
            }
    
            const numericAmount = parseFloat(amount); // Convert input to a number
            const converted = (numericAmount * data.rates[toCurrency]).toFixed(2);
            
            setConvertedAmount(`${converted} ${toCurrency}`); // Use `converted`, not `convertedAmount`
        } catch (error) {
            console.error("Error Fetching", error);
        } finally {
            setConverting(false);
        }
    };
    
    

    const handleFavorite = (currency) => {
        let updatedFavorites = [...favorites];

        if (favorites.includes(currency)) {
            updatedFavorites = updatedFavorites.filter(fav => fav !== currency)
        }
        else {
            updatedFavorites.push(currency);
        }

        setFavorites(updatedFavorites);
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
    };

    const swapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    return (
        <div className="max-w-xl mx-auto my-10 p-5 bg-white rounded-lg shadow-md">
            <h2 className="mb-5 text-4xl font-semibold text-gray-700">
                Currency Converter
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <Currencydropdown favorites={favorites} currencies={currencies} title="From:" currency={fromCurrency} setCurrency={setFromCurrency} handleFavorite={handleFavorite}/>
                
                <div className="flex justify-center -mb-5 sm:mb-0">
                    <button onClick={swapCurrencies} className="p-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300">
                        <HiArrowsRightLeft className="text-xl text-gray-700" />
                    </button>
                </div>
                <Currencydropdown favorites={favorites} currencies={currencies} title="To:" currency={toCurrency} setCurrency={setToCurrency} handleFavorite={handleFavorite}/>
            </div>

            <div className="mt-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount:</label>
                <input value={amount} onChange={ (e) => setAmount(e.target.value)} type="number" className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>

            <div className="flex justify-end mt-6">
                <button onClick={currencyConvert} className={`px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-7 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${converting ? "animate-pulse" : "" }`}>Convert</button>
            </div>

            {convertedAmount && (
                <div className="mt-4 text-lg font-medium text-right text-green-600">
                    Converted Amount: {convertedAmount}
                </div>
            )}
        </div>
    )
}

export default CurrencyConverter;