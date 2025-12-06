library(shiny)
library(dplyr)
library(tidyr)
library(svglite)
library(ggplot2)

# Load dataset
if(!exists("injuries")){
  injuries <- vroom::vroom("data/injuries.tsv.gz")
  products <- vroom::vroom("data/products.tsv")
  population <- vroom::vroom("data/population.tsv")
  
  injuries <- injuries %>%
    left_join(products %>% 
                rename(products = title), by = "prod_code") %>% 
    inner_join(population, by = c("age", "sex"))
}

# Define UI variables
pageIds <- c("overview","crossAnalysis","ageGroups","locationHeatmap")
fields <- list(body_part="Body Part",diag="Diagnosis",products="Products")

ui <- div( id="shiny-app", class="flex-col",
  `data-pageids`=jsonlite::toJSON(pageIds), 
  `data-fields`= jsonlite::toJSON(fields, auto_unbox = TRUE),
  `data-bodyparts`= jsonlite::toJSON(sort(unique(injuries$body_part))),
  tags$head(
    tags$title("NEISS Decision Intelligence"),
    tags$link(rel = "stylesheet", type = "text/css", href = "styles.css")
  ),
  
  div(
    id = "loading-overlay",
    class = "loading-overlay",
    div(class = "spinner")
  ),
  
  div(id="app-header", class="flex gap-05 header"),
  
  # Overview
  div(class="page flex fgrow-1 jus-btwn",id=pageIds[1],
      `data-races`= jsonlite::toJSON(sort(unique(injuries$race))),
  ),
  # Cross Analysis
  div(class="page flex fgrow-1 jus-btwn",id=pageIds[2]),
  # Age Groups
  div(class="page flex fgrow-1 gap-1",id=pageIds[3]),
  # Location Heatmap
  div(class="page flex fgrow-1 gap-1",id=pageIds[4]),
  
  tags$script(src = "script.js",type = "module")
)

server <- function(input, output, session) {
  
  filtered_data <- reactive({
    dframe <- injuries
    
    dframe
  })
  
  # Overview page API
  overview_data <- reactive({
    dframe <- injuries

    
    if (input$genderInput != "all"){
      dframe <- dframe[dframe$sex == input$genderInput, ]
    } 
    
    if (is.null(input$raceOptions) ) {
      dframe <- dframe[0, ]
    } else {
      races <- gsub("^overview-", "", input$raceOptions)
      dframe <- dframe[dframe$race %in% races, ]
    }
    
    
    dframe
  })
  
  overview_pop <- reactive({
    dframe <- population

    
    if (input$genderInput != "all"){
      dframe <- dframe[dframe$sex == input$genderInput, ]
    } 
    
    

    dframe
    
  })

  
  observeEvent(c(overview_data(),overview_pop()),{
    
    filtered <- overview_data()
    
    
    
    sex_filter <- function(gender) filtered %>%
      count(sex) %>%
      mutate(perc=round(n/sum(n)*100,1)) %>%
      filter(sex==gender) %>%
      select(perc) %>% pull
    
    sex_pop <- function(gender){
      a <-  overview_pop() %>%
        filter(sex==gender) %>%
        select(population) %>% sum()

      round(a/sum(overview_pop()$population)*100,2)
    }

    race_counts <- filtered %>%
      count(race,name="Counts") %>% 
      mutate(`%`=round(Counts/sum(Counts)*100,1))
    
    # Generate SVG for age distribution
    svg_string <- svgstring(width = 6, height = 4)
    plotColors <-  c("female" = "#f8766d", "male" = "#00bfc4")
    print( 
      ggplot(filtered, aes(x = age, fill = sex)) +
        geom_histogram(binwidth = 5, color = "white", position = "dodge") +
        scale_fill_manual(values =plotColors) +
        theme_bw()
    )
    
    age_dist_plot <- svg_string()
    dev.off()
    
    # Generate SVG for population
    svg_string <- svgstring(width = 6, height = 4)

    print(
      ggplot(overview_pop() , aes(x = age, y = population, color = sex)) +
        geom_line(linewidth = 1) +
        labs(x = "Age", y = "Population") +
        scale_color_manual(values =plotColors) +
        theme_bw()
    )

    population_plot <- svg_string()
    dev.off()
    
    gender_dist <- function(col) {
      filtered %>%
        count(!!sym(col), sex) %>%
        pivot_wider(names_from = sex, values_from = n, values_fill = 0) %>%
        mutate(
          male = if("male" %in% names(.)) male else 0,
          female = if("female" %in% names(.)) female else 0,
          total = male + female,
          tperc = round(total/sum(total)*100, 2),
          mperc = round(male/total*100, 2),
          fperc = round(female/total*100, 2)
        ) %>%
        arrange(desc(total))
    }
    
    session$sendCustomMessage("overviewAPI", list(
      nvisits = format(nrow(filtered), big.mark = ","),
      fvisits = sex_filter('female'),
      mvisits = sex_filter('male'),
      totalPop = format(sum(overview_pop()$population), big.mark = ","),
      fpop = sex_pop('female'),
      mpop = sex_pop('male'),
      raceCounts = race_counts,
      ageDistPlot = age_dist_plot,
      populationPlot = population_plot,
      bodyPart = gender_dist("body_part"),
      diagnosis =  gender_dist("diag"),
      products = gender_dist("products"),
      narratives = sample(filtered$narrative,10)
    ))
  })

  # Cross Analysis page API
  crosSelectTag <- "cross-selectTag"
  crossRadioButtons <-  "cross-radioButtons"
  observeEvent(input[[crosSelectTag]], {
    crosSelect <- input[[crosSelectTag]]
    filtered <- filtered_data()
    choices <- sort(unique(filtered[[crosSelect]]))

    session$sendCustomMessage(
      "crossSelect", list(inputName =  crossRadioButtons,labels = choices)
    )
  })
  
  observeEvent(input[[crossRadioButtons]], {
    filtered <- filtered_data() 
    
    summarize_by_sex <- function(col) filtered %>%
      filter(!!sym(input[[crosSelectTag]]) == input[[crossRadioButtons]]) %>% 
      group_by(!!sym(col), sex) %>%
      summarise(
        n = n(),weight = sum(weight, na.rm = TRUE),.groups = "drop"
      ) %>%
      pivot_wider(
        names_from = sex, values_from = c(n, weight), values_fill = 0
      ) %>%
      mutate(
        n_male = if("n_male" %in% names(.)) n_male else 0,
        n_female = if("n_female" %in% names(.)) n_female else 0,
        weight_male = if("weight_male" %in% names(.)) weight_male else 0,
        weight_female = if("weight_female" %in% names(.)) weight_female else 0,
        total_n = n_male + n_female,
        total_weight = round(weight_male + weight_female,0),
        tperc = round(total_n/sum(total_n)*100, 2),
        mperc = round(n_male/total_n*100, 2),
        fperc = round(n_female/total_n*100, 2)
      ) %>%
      arrange(desc(total_n))
    
    titles = list(
      body_part = "Injured Body Parts",
      diag = "Diagnosis Of Patients",
      products = "Injuries by Related Product"
    )
    
    cols <- Map(function(name, title, key) {
      list(name = name, title = title, summary=summarize_by_sex(key))
    }, fields, titles[names(fields)], names(fields))
    
    estimate <- filtered_data() %>%
      filter(!!sym(input[[crosSelectTag]]) == input[[crossRadioButtons]]) %>% 
      pull(weight) %>% sum() 
    
    rem_variables <- setdiff(names(fields), input[[crosSelectTag]])
    
    estimates <- filtered_data() %>%
      filter(!!sym(input[[crosSelectTag]]) == input[[crossRadioButtons]]) %>%
      group_by(!!sym(rem_variables[1]), !!sym(rem_variables[2])) %>%
      summarise(
        cases = round(sum(weight)),
        .groups = "drop"
      ) %>%
      arrange(desc(cases))
    
    session$sendCustomMessage(
      "crossRadioButtons", list(
        summary = cols[rem_variables],
        variable = input[[crosSelectTag]],
        variableName = input[[crossRadioButtons]],
        estimate = round(estimate,0),
        estimates = estimates
      )
    )
    
  })
  
  # Age Groups page API
  ageSelectTag <- "age-selectTag"
  ageRadioButtons <-  "age-radioButtons"
  observeEvent(input[[ageSelectTag]], {
    filtered <- filtered_data()
    ageSelect <- input[[ageSelectTag]]
    choices <- sort(unique(filtered[[ageSelect]]))

    session$sendCustomMessage(
      "ageSelect", list(inputName =  ageRadioButtons,labels = choices)
    )

  })
  
  observeEvent(input[[ageRadioButtons]], {
    filtered <- filtered_data() 
   
    field <- sym(input[[ageSelectTag]])
    variable <- sym(input[[ageRadioButtons]])
    
    field_summary <- filtered %>%
      count(!!field) %>%
      mutate( perc=round(n/sum(n)*100,2) ) %>%
      filter(!!field == variable) 
      
    
    gender_filter <- function(gender) filtered %>%
      filter(!!field == variable)  %>%
      summarise(
        total = n(),
        gender_count = sum(sex == gender, na.rm = TRUE),
        perc = round(gender_count/total*100, 1)
      ) %>%
      pull(perc)
    
    age_groups <-  c("0 - 5","6 - 12","13 - 19","20 - 35","36 - 64","65 +")
    ageRace_group <- function(r) filtered %>%
        filter(!!field == variable, race == r) %>%
        mutate( ageGroup = cut(
          age, 
          breaks = c(-Inf, 5, 12, 19, 35, 64, Inf),
          labels = age_groups,
          include.lowest = TRUE
        )) %>%
        count(ageGroup) %>% 
        mutate(percentage = round(n/sum(n)*100, 4))
  
    race_agegroups <- sort(unique(filtered$race)) %>%
      setNames(., .) %>%
      lapply( ageRace_group) %>%
      .[sapply(., function(x) nrow(x) > 0)]

    age_counts <- injuries %>%
      filter(!!field == variable) %>%
      count(age) %>% 
      arrange(desc(n))
    
    session$sendCustomMessage("ageRadioButtons", list(
      field = as.character(field),
      fieldName = fields[[as.character(field)]],
      fieldSummary = field_summary,
      femalePerc = gender_filter("female"),
      malePerc = gender_filter("male"),
      ageGroups = age_groups,
      raceAgeGroups = race_agegroups,
      ageCounts = age_counts
    ))
  })
  
  # Location Heatmap page API
  locSelectTag <- "location-selectTag"
  locRadioButtons <-  "loc-radioButtons"
  observeEvent(input[[locSelectTag]], {
    filtered <- filter(filtered_data(), body_part == input[[locSelectTag]])

    gender_filter <- function(gender) filtered %>%
      summarise(
        total = n(),
        gender_count = sum(sex == gender, na.rm = TRUE),
        perc = round(gender_count/total*100, 1)
      ) %>%
      pull(perc)
    
    session$sendCustomMessage(
      "locSelect", list(
        inputName =  locRadioButtons,
        labels = unique(filtered$products),
        count = nrow(filtered),
        femalePerc = gender_filter("female"),
        malePerc = gender_filter("male"),
        raceCounts = filtered %>% count(race)
      )
    )
  })
  
  observeEvent(input[[locRadioButtons]], {
    filtered <- filter(
      injuries, 
      products == input[[locRadioButtons]], 
      body_part == input[[locSelectTag]]
    )
    
    gender_filter <- function(gender) filtered %>%
      summarise(
        total = n(),
        gender_count = sum(sex == gender, na.rm = TRUE),
        perc = round(gender_count/total*100, 1)
      ) %>%
      pull(perc)
    
    svg_string <- svgstring(width = 6, height = 4)
    print( 
      ggplot(filtered %>% count(diag, location), aes(x = location, y = diag)) +
      geom_tile(aes(fill = n)) +
      scale_fill_viridis_c() +
      theme_bw() +
      theme(
        axis.text.x = element_text(angle = 45, hjust = 1),
        plot.title = element_text(size = 12)
      ) +
      labs(x = "Location", y = "Diagnosis", fill = "Count")
    )
    location_heatmap <- svg_string()
    dev.off()
    
    session$sendCustomMessage("locRadioBUtton", list(
      product = input[[locRadioButtons]],
      narratives = filtered$narrative,
      locationHeatmap = location_heatmap,
      count = nrow(filtered),
      femalePerc = gender_filter("female"),
      malePerc = gender_filter("male"),
      raceCounts = filtered %>% count(race)
    ))
    
  })
  
}

shinyApp(ui, server)