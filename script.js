```
// Add JavaScript code for search functionality here
```
'use strict';

var TvGuide = BlazeComponent.extendComponent(
    function TvGuideConstructor() {
        var me = this;

        me.timeStart = function() {
            var now = new Date(),
                min = Math.floor(now.getMinutes() / 30) * 30;

            return new Date(now.setMinutes(min)).getTime() - 1.8e6;
        };

        me.ratio = 1;
    }, {
        events: function() {
            return [{}];
        },
        /*
         *  Data Context Helpers
         */
        getTimeslotLabels: function() {
            var me = this,
                now = new Date(me.timeStart()),
                // now = new Date(),
                nowHour = now.getHours(),
                nowMinute = now.getMinutes(),
                // nowMinute = Math.floor(now.getMinutes()/30) * 30,
                dow = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'],
                moy = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
                timeslots = [],
                colon,
                makeTime = function(hour, minutes) {
                    if (minutes.toString().length === 1)
                        minutes = '0' + minutes + '';
                    if (hour >= 12)
                        return hour === 12 ? 12 + ':' + minutes + 'PM' : (hour - 12) + ':' + minutes + 'PM';
                    else
                        return hour + ':' + minutes + 'AM';
                };

            console.log(nowMinute);
            // Add initial start time
            timeslots.push({
                timeslot: dow[new Date().getUTCDay()] + ' ' + moy[new Date().getUTCMonth()] + ', ' + new Date().getDay(),
                width: 10 / me.ratio
            });
            if(nowMinute === 30)
                timeslots.push({
                    timeslot: makeTime(nowHour++, '30'),
                    width: 10/ me.ratio
                });
            else
                timeslots.push({
                    timeslot: makeTime(nowHour, '00'),
                    width: 10/ me.ratio
                });
            // if (nowMinute < 55) {
            //     if (nowMinute > 25 && nowMinute <= 30) {
            //         timeslots.push({
            //             timeslot: makeTime(nowHour, '30'),
            //             width: 10 / me.ratio
            //         });
            //     } else {
            //         if (nowMinute > 30) {
            //             // timeslots.push({
            //             //     timeslot: makeTime(nowHour++, nowMinute),
            //             //     width: ((60 - nowMinute) * 10 / 30) / me.ratio
            //             // });
            //             nowHour--;
            //             timeslots.push({
            //                 timeslot: makeTime(nowHour++, '30'),
            //                 width: 10 / me.ratio
            //             });
            //             timeslots.push({
            //                 timeslot: makeTime(nowHour, '00'),
            //                 width: 10 / me.ratio
            //             });
            //         } else {
            //             timeslots.push({
            //                     timeslot: makeTime(nowHour, '0'),
            //                     width: 10 / me.ratio
            //                 })
            //                 // timeslots.push({
            //                 //     timeslot: makeTime(nowHour, nowMinute),
            //                 //     width: ((30 - nowMinute) * 10 / 30) / me.ratio
            //                 // });
            //         }
            //     }
            // } else {
            //     nowHour++;
            //     timeslots.push({
            //         timeslot: makeTime(nowHour, '00'),
            //         width: 10 / me.ratio
            //     });
            // }
            while (timeslots.length < 10) {
                colon = timeslots[timeslots.length - 1].timeslot.indexOf(':');
                if (timeslots[timeslots.length - 1].timeslot.indexOf(':30') !== -1)
                    timeslots.push({
                        timeslot: makeTime(nowHour, '00'),
                        width: 10 / me.ratio
                    });
                else
                    timeslots.push({
                        timeslot: makeTime(nowHour++, '30'),
                        width: 10 / me.ratio
                    });
            }

            me.timeslots = timeslots;
            return timeslots;
        },
        getNowMarkerPosition: function() {
            var me = this,
                now = new Date().getTime();

            return ((now - me.timeStart()) / 60 / 1000 / 30 * 10) + 10;
        },
        getChannels: function() {
            return Channels.find();
        },
        getAirings: function() {
            var me = this,
                currentData = me.currentData(),
                channelAirings = Airings.find({
                    channel: currentData.channel
                });
            return channelAirings;
        },
        getHdLevel: function() {
            var me = this,
                currentData = me.currentData();

            if (!currentData || !currentData.hdLevel || currentData.hdLevel.indexOf('Unknown') !== -1)
                return;
            else if ((currentData && currentData.hdLevel) && (currentData.hdLevel.indexOf('480') !== -1))
                return 'SD';
            else if ((currentData && currentData.hdLevel) && (currentData.hdLevel.indexOf('720') !== -1 || currentData.hdLevel.indexOf('1080') !== -1 || currentData.hdLevel.indexOf('4') !== -1))
                return 'HD';
        },
        getWidth: function() {
            var me = this,
                now = me.timeStart(),
                currentData = me.currentData(),
                startTime = parseInt(new Date(currentData.airingTime).getTime()),
                endTime = parseInt(new Date(currentData.airingTimeEnd).getTime()),
                diff = {
                    startToNow: now - startTime,
                    startToEnd: endTime - startTime
                };

            if (now > startTime) {
                diff.remaining = ((endTime - startTime) - (now - startTime)) / 60 / 1000 * 10 / 30;
                // if (diff.remaining < 0 || diff.remaining >= 100)
                //     return 100;
            } else
                diff.remaining = (endTime - startTime) / 60 / 1000 * 10 / 30;

            return diff.remaining <= 1.5 ? 0 : diff.remaining / me.ratio;
        },
        getPosition: function() {
            var me = this,
                currentData = me.currentData(),
                now = me.timeStart(),
                startTime = new Date(currentData.airingTime).getTime(),
                position = (startTime - now) / 60 / 1000 / 30 * 10;

            return (position <= 0 ? 10 : position + 10) / me.ratio;
        },
        convertTime: function(date) {
            if (!date)
                return;
            else if (!_.isDate(date))
                date = new Date(date);

            var hours = date.getHours(),
                minutes = date.getMinutes() || 0,
                ampm;

            ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours + '' : 12 + ''; // the hour '0' should be '12'
            minutes = parseInt(minutes) < 10 ? '0' + minutes : minutes;

            return hours + ':' + minutes + ampm;
        }
    }
).register('TvGuide');