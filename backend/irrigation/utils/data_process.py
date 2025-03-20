def data_process(data_list):
    by_10_days_data = {}

    #processing faster with python dict vs pd dataframe

    for row in data_list:
    # print(row["date"].day, row["date"].month, row["date"].year)
        decade_index = ((int(row["date"].day) -1) // 10) +1
        if decade_index == 4:
            decade_index = 3

        month = str(row['date'].month)
        date = row['date']
        dec_name = f"days_decade{decade_index}"

        if month not in by_10_days_data:
            by_10_days_data[month] = {}

        if "days_decade" not in by_10_days_data[month]:
            by_10_days_data[month]["days_decade"]= {}
        if str(decade_index) not in by_10_days_data[month]["days_decade"]:
            by_10_days_data[month]["days_decade"][str(decade_index)]= {}
            by_10_days_data[month]["days_decade"][str(decade_index)]["values"] = []
        else:
            # by_10_days_data[month]["days_decade"][str(decade_index)].append(row['date'].strftime("%Y-%m-%d"))
            by_10_days_data[month]["days_decade"][str(decade_index)]["values"].append(row["et0"])
            by_10_days_data[month]["days_decade"][str(decade_index)]["mean_ET0"] = sum(by_10_days_data[month]["days_decade"][str(decade_index)]["values"]) / len(by_10_days_data[month]["days_decade"][str(decade_index)]["values"])
    
    return by_10_days_data