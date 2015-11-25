angular.module('cmsController', [])

    .controller('dashboardCtl', ['$scope', '$http', 'topology', '$interval', function ($scope, $http, topology, $interval) {

        $scope.title = "CMS Cloud Dashboard Console";
        $scope.formData = {
            server: "16.165.219.18:9091",
            view: "HPE SH DataCenter",
            container: "Container_RunningSoftware",
            interval: 2,
            lenLineChart: 100,
            pageSize: 5,
//            animation: "<None>",
//            random: 'false',
            ciType: 'event'
        };

        $scope.statistics = {};
        $scope.time = "";
        $scope.currentPage = 0;
        $scope.raw = [];
        $scope.cis = [];
        $scope.chartAnimation = chartAnimation;

        // get UCMDB TQL data
        $scope.getREST = function () {
            $scope.getContainer();
            $scope.getTopology();
        };

        $scope.getContainer = function () {
            topology.getContainer($scope.formData).success(function (data) {

                var RSNumber = {};

                data.cis.map(function (obj) {
                    if (obj.type in RSNumber)
                        RSNumber[obj.type]++;
                    else
                        RSNumber[obj.type] = 1;
                });

                $scope.updateDoughnutChart($scope.doughnut, RSNumber);

            });
        };

        $scope.getTopology = function () {
            topology.get($scope.formData).success(function (data) {
                var d = new Date();
                $scope.time = d.toLocaleString();

                if (data.cis instanceof Array) {

                    $scope.raw = data.cis; // save raw data

                    var ciNumber = {};
                    var ISNumber = {};
                    data.cis.map(function (obj) {

                        // count all CI type
                        if (obj.type in ciNumber)
                            ciNumber[obj.type]++;
                        else
                            ciNumber[obj.type] = 1;

                        // create time
                        if ('create_time' in obj.properties) {
                            obj.properties['timestamp'] = Date.parse(obj.properties['create_time']);
                        }

                        // count install software name
                        if (obj.type == 'installed_software') {
                            if (obj.properties['display_label'] in ISNumber)
                                ISNumber[obj.properties['display_label']]++;
                            else
                                ISNumber[obj.properties['display_label']] = 1;
                        }
                    });

                    $scope.updateLineChart($scope.lineChart, ciNumber);
                    $scope.updateBarChart($scope.barChart, ISNumber);

                    $scope.statistics = ciNumber;	// caculate statistics

                    $scope.queryCis($scope.formData.ciType); // query specified Cis by ciType

                }

            });
        };

        // build records
        $scope.queryCis = function (ciType) {

            $scope.formData.ciType = ciType;
            $scope.disp_ciType = ciType;

            // save web storage
            if (localStorage)
                localStorage.ciType = $scope.formData.ciType;

            $scope.cis = [];
            for (i in $scope.raw) {
                if ($scope.raw[i].type == ciType && $scope.raw[i].properties)
                    $scope.cis.push($scope.raw[i].properties);
            }

        };

        // capitalize each word, replace _ to " "
        $scope.t2t = function (type) {
            return type.replace(/_/g, " ").capitalize();
        };


        // form behavior ==========================================
        $scope.submit = function () {
            for (form in $scope.formData) {
                $scope.formData[form] = $scope["disp_" + form];

                // save web storage
                if (localStorage)
                    localStorage[form] = $scope.formData[form];
            }

            $scope.getREST();
            $scope.setInterval();
            $scope.initCharts();

        };

        $scope.reset = function () {

            for (form in $scope.formData) {
                // load web storage
                if (localStorage)
                    $scope.formData[form] = localStorage[form] ? localStorage[form] : $scope.formData[form];

                $scope["disp_" + form] = $scope.formData[form]
            }

        };

        $scope.setInterval = function () {
            $interval.cancel(interval);
            interval = $interval(function () {
                $scope.getREST();
            }, $scope.formData.interval * 1000);
        };

        $scope.disp = function () {
            var display = false;
            for (form in $scope.formData) {
                display = display || ($scope.formData[form] != $scope["disp_" + form]);
            }
            return display;
        };


        // list order by and pagination =============================
        $scope.predicate = 'timestamp';
        $scope.reverse = true;
        $scope.order = function (predicate) {
            console.log("order: " + predicate);
            $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
            $scope.predicate = predicate;
        };

        $scope.jump = function (i) {
            var pos = i;
            $scope.currentPage = pos;
        };


        // chart ==================================================
        $scope.updateLineChart = function (chart, ciNumber) {

            while (chart.labels.length < $scope.formData.lenLineChart) {
                chart.labels.push("");
                chart.data[0].push(0);
            }
            if ($scope.statistics['event']) {

                chart.labels.push("");
                // chart.series = ['Event'];
//                if ($scope.formData.random == 'true')
//                    chart.data[0].push(Math.round(Math.random() * 10));
//                else
                chart.data[0].push(ciNumber['event'] - $scope.statistics['event']);

                // keep length
                while (chart.labels.length > $scope.formData.lenLineChart) {
                    chart.labels.shift();
                    chart.data[0].shift();
                }

            }
        };

        $scope.updateBarChart = function (chart, ISNumber) {
            chart.data = [];
            chart.labels = [];


            for (is in ISNumber) {

                if (chart.series.indexOf(is) < 0) {
                    chart.data.push([ISNumber[is]]);
                    chart.series.push(is);
                } else {
//                    if ($scope.formData.random == 'true')
//                        chart.data[chart.series.indexOf(is)] = [ISNumber[is] + Math.round(Math.random() * 10)];
//                    else
                    chart.data[chart.series.indexOf(is)] = [ISNumber[is]];
                }
            }
            for (s in chart.series) {
                if (!(chart.series[s] in ISNumber)) {
                    chart.series.splice(s, 1);
                    chart.data.splice(s, 1);
                }

            }
        };

        $scope.updateDoughnutChart = function (chart, RSNumber) {
            chart.data = [];
            chart.labels = [];
            for (rs in RSNumber) {
//                if ($scope.formData.random == 'true')
//                    chart.data.push(RSNumber[rs] + Math.round(Math.random() * 10));
//                else
                chart.data.push(RSNumber[rs]);
                chart.labels.push($scope.t2t(rs));
            }
        };

        $scope.initCharts = function () {
            $scope.chart_data = [];
            $scope.lineChart = {
                data: [$scope.chart_data],
                labels: [],
                series: ['Event'],
                options: chart_line
            };


            $scope.barChart = {
                data: [],
                labels: [],
                series: [],
                options: chart_bar
            };


            $scope.doughnut = {
                labels: [],
                data: [],
                options: chart_circle
            };

            // $scope.lineChart.options = Object.assign(chart_global, chart_line);
//            Chart.defaults.global.animation = !($scope.formData.animation == "<None>");
//            Chart.defaults.global.animationEasing = $scope.formData.animation;


        };

        // initial ======================================================
        $scope.reset();	// inital run for set disp value
        $scope.initCharts();
        $scope.getREST(); // inital get, then interval
        var interval = $interval(function () {
            $scope.getREST();
        }, $scope.formData.interval * 1000);

    }]);
