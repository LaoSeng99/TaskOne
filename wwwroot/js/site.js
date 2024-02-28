$(function () {
    let allCustomerData;
    let counting = 0;
    var dataTableSetting = {
        paging: true,
        pageLength: 5,
        lengthChange: false,
        ordering: true,
        info: false,
        border: 1,
        searching: false,
        info: true,
        columnDefs: [
            {
                "targets": -1,  //last column
                "className": "actions-column"
            }
        ]
    }
    var customerTable = $("#customerTable").DataTable(dataTableSetting)

    // view button listening
    customerTable.on('click', `td i.fa.fa-eye`, function () {

        var data = customerTable.row($(this).closest('tr')).data();
        $("#customer-detail-form #customer-name").val(data[1])
        $("#customer-detail-form #customer-address").val(data[2])
        $("#customer-detail-form #customer-country").val(data[3])
        $("#customer-detail-form #customer-state").val(data[4])
        $("#customer-detail-form #customer-city").val(data[5])
        $("#customer-detail-form #customer-pinCode").val(data[6])
    });

    function setupData() {
        $.get("home/GetAll", function (data) {
            allCustomerData = data;
            var groupByCountry = {};
            let fullData = [];
            $.each(data, function (index, c) {
                var country = c.country;
                var state = c.state;

                // if groupByCountry dont have the country
                if (!groupByCountry[country]) {
                    // add the country
                    groupByCountry[country] = {
                        Country: country,
                        States: {}
                    };
                }
                //if the state in the country dont have the state
                if (!groupByCountry[country].States[state]) {
                    // add the state
                    groupByCountry[country].States[state] = {
                        State: state,
                        Cities: []
                    };
                }
                let checkExistCity = groupByCountry[country].States[state].Cities.some(city => city === c.city);
                if (!checkExistCity) {
                    groupByCountry[country].States[state].Cities.push(c.city);
                }
                var newRowData = [
                    index + 1,
                    c.name,
                    c.address,
                    c.country,
                    c.state,
                    c.city,
                    c.pinCode,
                    ` <i class='fa fa-eye' style='font-size:18px;color: #4b73fd' data-bs-toggle="modal" data-bs-target="#exampleModal"></i>
                      <i class='fa fa-pencil' style='font-size:18px;color:orange'></i>
                      <i class='fa fa-trash' style='font-size:18px;color:red'></i>`
                ];
                fullData.push(newRowData)
                if (index == data.length - 1) customerTable.rows.add(fullData).draw();

            })

            //groupByCountry== {country { states:{ citry:[]}}, ...}
            let fullTreeNode = []
            let isFirst = true;
            $.each(groupByCountry, function (key, country) {
                //country object

                //create country node
                let countryNode = generateNode(country.Country, `#${country.Country.toLowerCase()}`, ['country'], [], isFirst = isFirst);
                isFirst = false;
                $.each(country.States, function (key, state) {
                    //state object

                    //create state node
                    let stateNode = generateNode(state.State, `#${state.State.toLowerCase()}`, ['state'], []);
                    //city array
                    $.each(state.Cities, function (index, city) {

                        //create city node
                        let cityNode = generateNode(city, `#${city.toLowerCase()}`, ['city']);
                        //add to the state
                        stateNode.nodes.push(cityNode);
                    })
                    //add to the country
                    countryNode.nodes.push(stateNode);
                })

                fullTreeNode.push(countryNode)
            })


            $('#treeview1').treeview({
                data: fullTreeNode,
                collapseIcon: 'fa fa-minus',
                expandIcon: 'fa fa-plus',
            });


            $("#treeview1").on('nodeUnselected nodeSelected', function (event, data) {
                if (event.type == "nodeUnselected") counting--
                if (event.type == "nodeSelected") counting++

                let type = data.tags[0]
                let name = counting == 0 ? "" : data.text;

                let fitleredData = allCustomerData.filter(e => e[type] == name || name == "")

                customerTable.clear();

                $.each(fitleredData, function (index, c) {
                    customerTable.row.add([
                        index + 1,
                        c.name,
                        c.address,
                        c.country,
                        c.state,
                        c.city,
                        c.pinCode,
                        ` <i class='fa fa-eye' style='font-size:18px;color: #4b73fd' data-bs-toggle="modal" data-bs-target="#exampleModal"></i>
                      <i class='fa fa-pencil' style='font-size:18px;color:orange'></i>
                      <i class='fa fa-trash' style='font-size:18px;color:red'></i>`
                    ]);

                })
                customerTable.draw()
            });

        })
    }
    function generateNode(text, href, tags, nodes, isFirst) {

        return {
            text: text,
            href: href || '#',
            tags: tags,
            nodes: nodes || null, // if not null, will display collapse icon or expand icon
            state: {

                expanded: isFirst,

            },
        };
        //{
        //    text: "Node 1",
        //    icon: "glyphicon glyphicon-stop",
        //    selectedIcon: "glyphicon glyphicon-stop",
        //    color: "#000000",
        //    backColor: "#FFFFFF",
        //    href: "#node-1",
        //    selectable: true,
        //    state: {
        //        checked: true,
        //        disabled: true,
        //        expanded: true,
        //        selected: true
        //    },
        //    tags: ['available'],
        //    nodes: [{},...]
        //}

    }
    function validateSubmit() {
        if (!checkString($("#password").val()) ||
            !checkString($("#userId").val())) {
            $("#submitBtn").prop("disabled", true);
        } else {

            $("#submitBtn").prop("disabled", false);
        }

    }
    function checkString(text) {
        if (text == "" || typeof text === undefined || text == null)
            return false;

        return true;
    }
    setupData()

    $(".login-input").on("change", function () {
        validateSubmit()
    })
    $("#submitBtn").on("click", function () {
        let userID = $("#userId").val();
        let password = $("#password").val();
        $.post("home/Login", { UserID: userID, Password: password }, function (response) {

            if (!response) {
                $("#password").val("").addClass("is-invalid")
                $("#submitBtn").prop("disabled", true);
                showAlert($(".alert-danger"))
                dismissAlert($(".alert-danger"))
                return;
            }

            $("#password").removeClass("is-invalid")
            showAlert($(".alert-success"))
            dismissAlert($(".alert-success"))
        
        })
    })

    function showAlert(alert) {

        alert.slideDown();

    }
    function dismissAlert(alert) {
        setTimeout(function () {
            alert.slideUp();
        }, 5000)
    }
})