from datetime import datetime


months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
days_decade_names = ["days 1 to 10","11 to 20", "Rest of {}"]



def calendar_generate(task, by_10_days_data, calendar_request):
    display_data=[]
  
    # plot age
    PLOT_AGE_YEARS = int(task.age)
    #salinity 
    WATER_SALINITY = task.salinity
    # syst efficiency (Efficience d'application du système d'irrigation Ea)
    Ea = task.efficiency
    #Plot surface
    PLOT_SURFACE = float(task.surface)
    #culture
    CROP_TYPE = task.culture
    # irrigation syst type
    IRRIGATION_SYSTEM = task.irrigation
    
    #Espacements lignes, plantes (m)
    INTER_LINE = float(calendar_request.inter_line)
    INTRA_LINE = float(calendar_request.intra_line)


    print("calendar data in back", calendar_request)
    

    # Foliage diameter
    FOLIAGE_DIAMETER = float(calendar_request.foliage_diameter)

    # debit a la source LITRE/SECONDE
    DEBIT_SRC_LITRE_SCND = float(calendar_request.source_rate_l_second)
    DEBIT_SRC_M3_HEURE = (DEBIT_SRC_LITRE_SCND * 3600)/1000


    # debit goutteur(litre/heure)
    DEBIT_GOUTTEUR_LITER_HOUR = float(calendar_request.dripper_rate_liter_hour)
    # NBRE GOUTTEURS/ARBRE
    NBRE_GOUTTEUR_ARBRE = int(calendar_request.number_drippers_plant)


    if(PLOT_AGE_YEARS <=2):
        KC = 0.3
    elif(PLOT_AGE_YEARS <=5):
        KC = 0.4
    elif(PLOT_AGE_YEARS <=10):
        KC = 0.6
    elif(PLOT_AGE_YEARS >10):
        KC = 0.6


    # cover rate (%): (D*D*Pi)*100 / 4*INTER_LINE*INTRA_LINE
    TS = INTER_LINE*INTRA_LINE

    TX = ((FOLIAGE_DIAMETER*FOLIAGE_DIAMETER*3.14)*100)/(4*TS)

    KR = 2*(TX/100)



    #surface utile  (SU, m2) d'un olivier produit des 2 écartements = INTER_LINE x INTRA_LINE
    SU = INTER_LINE * INTRA_LINE




    #nombre plantes/ha
    DENSITY_PPH = 10000/SU

    #Débit d'eau par arbre (litre/heure) = Débit d'un goutteur (litre/heure)* Nombre de goutteurs/arbre
    DEBIT_ARBRE_LITER_HOUR = DEBIT_GOUTTEUR_LITER_HOUR * NBRE_GOUTTEUR_ARBRE


    #Débit total à la parcelle (litre/heure) = Débit par arbre * Nombre d'arbres/ha
    DEBIT_TOTAL_PARCELLE_LITER_HOUR = DEBIT_ARBRE_LITER_HOUR * DENSITY_PPH

    #Débit total à la parcelle m3/heure/ha
    DEBIT_TOTAL_PARCELLE_M3_HEURE_HA = DEBIT_TOTAL_PARCELLE_LITER_HOUR / 1000

    # Pluviométrie horaire des goutteurs (mm/h) = Débit par arbre (litre/heure) : Surface utile d'un arbre (m2)
    PLU_GOUTTEURS_MM_HOUR = DEBIT_ARBRE_LITER_HOUR / SU
    #Taille du poste d'irrigation (ha)=Débit à la source (m3/h): Débit à la parcelle (m3/h/ha)			

    TAILLE_POSTE_IRRIG = DEBIT_SRC_M3_HEURE / DEBIT_TOTAL_PARCELLE_M3_HEURE_HA

    NBRE_POSTE_IRRIG = PLOT_SURFACE / TAILLE_POSTE_IRRIG




    ###### leaching | lessivage #####

    
    # LEACHING_CONSIDER = False

    # if(WATER_SALINITY > 2.5 and LEACHING_CONSIDER):
    #     # Conductivité électrique mesurée au niveau de la solution du sol (mmhos/cm)
    #     CEI = None
    #     # CE limite pour l'olivier (mmhos/cm)
    #     CE_LIM =None
    #     # Calcul de la Fraction de lessivage (FL) qui est définie par : FL = CEi / (5*CE lim, - CEi)* 1/E			
    #     LEACHING_FRAC = CEI / (5*CE_LIM, - CEI)* 1/E
    #     # E Efficience du lessivage 
    #     E = None


    ############# RAIN ############
    #RAIN
    # RAIN_CONSIDER = False
    # if(RAIN_CONSIDER):
    PE = 0




    
    
    for month in by_10_days_data:
        for decade in by_10_days_data[month]["days_decade"]:
            etc = by_10_days_data[month]["days_decade"][decade]["mean_ET0"] * KC * KR
            needed_water_plot_I_corrected_mm = ((.7 * etc) - PE ) / Ea
            
            needed_water_m3_plant_day = (needed_water_plot_I_corrected_mm * 10) / DENSITY_PPH
            
            needed_water_litre_plant_day = round(1000 * needed_water_m3_plant_day,2)
            
            irrigation_time_in_hours_and_fractions = (needed_water_plot_I_corrected_mm ) / PLU_GOUTTEURS_MM_HOUR
            
            irrigation_time_hours = int((needed_water_plot_I_corrected_mm ) // PLU_GOUTTEURS_MM_HOUR)
            decimal_part_of_time_in_hours = (irrigation_time_in_hours_and_fractions) - ((needed_water_plot_I_corrected_mm ) // PLU_GOUTTEURS_MM_HOUR)
            irrigation_time_minutes = int(round(( decimal_part_of_time_in_hours)* 60,0))
            
            irrigation_span_hours = round(irrigation_time_in_hours_and_fractions * NBRE_POSTE_IRRIG)
   
            
            irrigation_time = f"{irrigation_time_hours} h {irrigation_time_minutes} minutes"
            
            if(irrigation_time_hours == 0):
                irrigation_time = f"{irrigation_time_minutes} minutes"
                
            by_10_days_data[month]["days_decade"][decade]["etc"] =  etc
            # by_10_days_data[month]["days_decade"][decade]["needed_water_mm_day"] =  needed_water_plot_I_corrected_mm
            by_10_days_data[month]["days_decade"][decade]["needed_water_litre_plant_day"] = needed_water_litre_plant_day
            by_10_days_data[month]["days_decade"][decade]["irrigation_time_in_hours_and_fractions"] = irrigation_time_in_hours_and_fractions
            by_10_days_data[month]["days_decade"][decade]["irrigation_time_hours"] = irrigation_time_hours
            by_10_days_data[month]["days_decade"][decade]["irrigation_time_minutes"] = irrigation_time_minutes
            by_10_days_data[month]["days_decade"][decade]["irrigation_span_hours"] = irrigation_span_hours
            
            # by_10_days_data[month]["days_decade"][decade]["needed_water_m3_plant_day"] = (needed_water_plot_I_corrected_mm * 10) / DENSITY_PPH
            
            if(decade == "3"):
                period_name = f"{days_decade_names[2].format(months[int(month)-1])}"
            else:
                period_name = f"{months[int(month)-1]} {days_decade_names[int(decade)-1]}"
                
            obj = {"period_name":period_name,
                   "et0_display_date":f"{datetime.now().year - 1}-{int(month)}-{int(decade)*10 -5}",
                   "mean_et0":by_10_days_data[month]["days_decade"][decade]["mean_ET0"]*2,
                    "needed_water_litre_plant_day":needed_water_litre_plant_day,
                    "irrigation_time_hours":irrigation_time_hours,
                    "irrigation_time_minutes": irrigation_time_minutes,
                    "irrigation_time" : irrigation_time,
                    "irrigation_span": irrigation_span_hours
                    }
            display_data.append(obj)
            
    return by_10_days_data, display_data