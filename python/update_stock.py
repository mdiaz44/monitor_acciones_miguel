import yfinance as yf
import pandas as pd
import json
import os


# ==========================================
# CONFIGURACIÓN
# ==========================================

from pathlib import Path


# ==========================================
# CONFIGURACIÓN DE RUTAS
# ==========================================

# Carpeta principal del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent


# Carpeta data dentro de Proyecto_monitor_acciones
DATA_DIR = BASE_DIR / "data"


# Archivos de entrada y salida
INPUT_FILE = DATA_DIR / "portfolio.csv"

OUTPUT_FILE = DATA_DIR / "portfolio.json"



# ==========================================
# FUNCIÓN PARA OBTENER DATOS
# ==========================================

def get_stock_data(ticker, name, shares, buy_price):

    print(f"Consultando {ticker}...")


    stock = yf.Ticker(ticker)


    history = stock.history(period="6mo")


    if history.empty:

        print(f"No se encontró información para {ticker}")

        return None



    last = history.iloc[-1]

    previous = history.iloc[-2]



    current_price = round(float(last["Close"]),2)



    change = round(
        current_price - float(previous["Close"]),
        2
    )


    change_percent = round(
        (change / float(previous["Close"])) * 100,
        2
    )



    # Valor actual de la posición

    current_value = round(
        current_price * shares,
        2
    )


    invested = round(
        buy_price * shares,
        2
    )


    profit = round(
        current_value - invested,
        2
    )


    profit_percent = round(
        (profit / invested) * 100,
        2
    )



    # Histórico para gráfica

    history_data = []


    for date,row in history.iterrows():

        history_data.append({

            "date":date.strftime("%Y-%m-%d"),

            "close":round(
                float(row["Close"]),
                2
            )

        })



    return {


        "ticker":ticker,


        "company":name,


        "shares":shares,


        "buyPrice":buy_price,


        "currency":"MXN",


        "price":current_price,


        "change":change,


        "changePercent":change_percent,


        "open":round(float(last["Open"]),2),


        "high":round(float(last["High"]),2),


        "low":round(float(last["Low"]),2),


        "volume":int(last["Volume"]),



        "invested":invested,


        "currentValue":current_value,


        "profit":profit,


        "profitPercent":profit_percent,



        "history":history_data


    }



# ==========================================
# LEER PORTAFOLIO
# ==========================================


portfolio_csv = pd.read_csv(INPUT_FILE)



portfolio = {

    "stocks":[],

    "summary":{

        "totalInvested":0,

        "totalValue":0,

        "totalProfit":0

    }

}



# ==========================================
# PROCESAR ACCIONES
# ==========================================


for _,row in portfolio_csv.iterrows():


    stock = get_stock_data(

        row["Ticker"],

        row["Nombre"],

        int(row["Acciones"]),

        float(row["PrecioCompra"])

    )


    if stock:


        portfolio["stocks"].append(stock)


        portfolio["summary"]["totalInvested"] += stock["invested"]

        portfolio["summary"]["totalValue"] += stock["currentValue"]

        portfolio["summary"]["totalProfit"] += stock["profit"]




# Redondear resumen


for key in portfolio["summary"]:

    portfolio["summary"][key] = round(

        portfolio["summary"][key],

        2

    )



# ==========================================
# GUARDAR JSON
# ==========================================


os.makedirs(

    "../data",

    exist_ok=True

)



with open(

    OUTPUT_FILE,

    "w",

    encoding="utf-8"

) as file:


    json.dump(

        portfolio,

        file,

        indent=4,

        ensure_ascii=False

    )



print("\n==============================")

print("Portafolio actualizado")

print("==============================")

print(

    portfolio["summary"]

)