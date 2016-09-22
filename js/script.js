window.addEventListener("load", function() {
    var XHR = new XMLHttpRequest(),
        xhrExperienceValues = new XMLHttpRequest(),
        container      = document.querySelector(".container"),
        searchField    = document.querySelector(".search-field"),
        searchButton   = document.querySelector("[type=button]"),
        workExperienceList = document.querySelector("select"),
        vacancies      = {},
        regExp = new RegExp(/&|=|\?|!|#|@|\$|%|\^|\*/),
        limit = 10,
        requestURL = {
            base: "https://api.hh.ru/",
            entity: "vacancies"
        };

    function showHideInfo() {
        var vacancyDetails = this.querySelector(".vacancy-details");
        console.log(vacancyDetails);
        if (!vacancyDetails.classList.contains("is-visible")) {
            vacancyDetails.classList.add("is-visible");
            vacancyDetails.parentNode.classList.add("vacancy-expanded");
        } else {
            vacancyDetails.classList.remove("is-visible");
            vacancyDetails.parentNode.classList.remove("vacancy-expanded");
        }
    }

    searchField.focus();

    xhrExperienceValues.addEventListener("load", function() {
        if (xhrExperienceValues.status === 200) {
            var experienceObjsArray = JSON.parse(xhrExperienceValues.responseText).experience,
                i = 0;
            console.log(experienceObjsArray);
            for (i = 0; i < experienceObjsArray.length; i++) {
                var option = document.createElement("option");
                option.innerHTML = experienceObjsArray[i].name;
                option.value = experienceObjsArray[i].id;
                workExperienceList.appendChild(option);
            }
        }
    });

    xhrExperienceValues.open("GET", requestURL.base + "dictionaries");
    xhrExperienceValues.send();

    XHR.addEventListener("load", function() {
        var outputString = "",
            vacanciesNumber = 0, i,
            links = [];
        if (XHR.status === 200) {
            var vacanciesArray = JSON.parse(XHR.responseText).items,
                vacanciesNumber = (vacanciesArray.length > limit) ? limit : vacanciesArray.length,
                vacancyBlock = {};
            console.log(JSON.parse(XHR.responseText));

            for (i = 0; i < vacanciesNumber; i++) {
                vacancyBlock = document.createElement("div");
                vacancyBlock.classList.add("vacancy");
                vacancyBlock.classList.add("js-vacancy");
                var item = vacanciesArray[i],
                    name = {},
                    company = {},
                    salary = {},
                    descriptionBlock = {},
                    snippet = {},
                    link = {},
                    publishingDate = {},
                    url = {};
                name = document.createElement("h2");
                name.innerHTML = item["name"];
                name.classList.add("vacancy-name");
                company = document.createElement("a");
                company.classList.add("vacancy-company");
                company.innerHTML = item["employer"].name;
                company.href = item["employer"].alternate_url;
                company.target = "_blank";
                salary = document.createElement("h2");
                salary.classList.add("vacancy-salary");
                salary.innerHTML = item.salary ?
                                   (item.salary.from ?
                                       (item.salary.to ?
                                       item.salary.from + " - " + item.salary.to: "от " + item.salary.from): "до " + item.salary.to) + " " + item.salary.currency : "З/п не указана";
                snippet = item["snippet"];
                descriptionBlock = document.createElement("div");
                descriptionBlock.classList.add("vacancy-details");
                descriptionBlock.innerHTML = '<h3>Требования</h3>' +
                                 "<p>" + snippet["requirement"] + "</p>" +
                                 "<h3>Обязанности</h3>" +
                                 "<p>" + snippet["responsibility"] + "</p>";
                link = document.createElement("a");
                link.classList.add("vacancy-link");
                link.href = item["alternate_url"];
                link.innerHTML = item["alternate_url"];
                link.target = "_blank";
                publishingDate = document.createElement("span");
                publishingDate.classList.add("vacancy-publishing-date");
                publishingDate.innerHTML = "Опубликовано " + item["published_at"].slice(0, 10);
                // url = document.createElement("input");
                // url.type = "hidden";
                // url.value = item["url"];


                vacancyBlock.appendChild(name);
                vacancyBlock.appendChild(company);
                vacancyBlock.appendChild(salary);
                vacancyBlock.appendChild(descriptionBlock);
                vacancyBlock.appendChild(link);
                vacancyBlock.appendChild(publishingDate);
                // vacancyBlock.appendChild(url);
                // outputString = '<div class="vacancy js-vacancy">';
                // outputString += "<h2>" + item["name"] + "</h2>" + " ";
                // link = '<a class="vacancy-link" href="' + item["alternate_url"] + '" target="_blank">' + item["alternate_url"] + "</a>";
                // snippet = item["snippet"];
                // publishingDate = '<span class="vacancy-publishing-date">' + "Опубликовано " + item["published_at"].slice(0, 10) + "</span>";
                // url = '<input type="hidden" value="' + item["url"] + '">'
                // outputString += '<div class="vacancy-details">' +
                //                 '<h3>Требования</h3>' +
                //                 "<p>" + snippet["requirement"] + "</p>" +
                //                 "<h3>Обязанности</h3>" +
                //                 "<p>" + snippet["responsibility"] + "</p>" +
                //                 "</div>" +
                //                 link +
                //                 publishingDate +
                //                 url +
                //                 "</div>";
                // container.innerHTML = container.innerHTML + outputString;
                container.appendChild(vacancyBlock);
            }


            vacancies = document.querySelectorAll(".js-vacancy");
            console.log("vacancies");
            console.log(vacancies);
            for (i = 0; i < vacancies.length; i++ ) {
                vacancies[i].addEventListener("click", showHideInfo);
            }

            links = document.querySelectorAll("a");
            for (i = 0; i < links.length; i++) {
                links[i].addEventListener("click", function(event) {
                    event.stopPropagation();
                });
            }
        }
    });

    searchButton.addEventListener("click", function(event) {
        container.innerHTML = "";
        if (!regExp.test(searchField.value)) {
            XHR.open("GET", requestURL.base + requestURL.entity +
                    "?text=" + searchField.value +
                    "&search_fields=name" +
                    "&experience=" + workExperienceList.value +
                    "&area=43" +
                    "&order_by=publication_time" +
                    "&per_page=10&page=0");
            XHR.send();
        } else {
            var errorMsg = document.createElement("p");
            errorMsg.innerHTML = "В строке поиска не должно быть специальных символов";
            errorMsg.classList.add("error-msg");
            container.appendChild(errorMsg);
        }
        searchField.focus();
    });

});
