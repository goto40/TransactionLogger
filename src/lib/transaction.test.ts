import {expect, test} from 'vitest';
import { convertDateToHtmlFormat, convertHtmlFormatToDate, getDayName, getGroupIdFromDate, getWeekNumber, getWeekNumber0 } from './transaction';

test('date from', () => {
  const date = convertHtmlFormatToDate('2024-01-15');
  expect(date.getDate()).toBe(15);
  expect(date.getMonth()).toBe(0);
  expect(date.getFullYear()).toBe(2024);
});

test('date to', () => {
  const dateText = convertDateToHtmlFormat(new Date(1975,6,3));
  expect(dateText).toBe('1975-07-03');
});

test('getDayName', () => {
  expect(getDayName(convertHtmlFormatToDate('2024-01-01'))).toBe("Mo");
  expect(getDayName(convertHtmlFormatToDate('2024-05-12'))).toBe("Su");
});

test('getWeekNumber', () => {
  expect(getWeekNumber(convertHtmlFormatToDate('2019-12-31'))).toBe(1);
  expect(getWeekNumber(convertHtmlFormatToDate('2020-01-01'))).toBe(1);

  expect(getWeekNumber(convertHtmlFormatToDate('2020-12-31'))).toBe(53);
  expect(getWeekNumber(convertHtmlFormatToDate('2021-01-01'))).toBe(53);

  expect(getWeekNumber(convertHtmlFormatToDate('2021-12-31'))).toBe(52);
  expect(getWeekNumber(convertHtmlFormatToDate('2022-01-01'))).toBe(52);

  expect(getWeekNumber(convertHtmlFormatToDate('2023-01-02'))).toBe(1);
  expect(getWeekNumber(convertHtmlFormatToDate('2023-01-01'))).toBe(52);
  expect(getWeekNumber(convertHtmlFormatToDate('2022-12-31'))).toBe(52);

  expect(getWeekNumber(convertHtmlFormatToDate('2022-01-03'))).toBe(1);
  expect(getWeekNumber(convertHtmlFormatToDate('2022-01-02'))).toBe(52);
  expect(getWeekNumber(convertHtmlFormatToDate('2022-01-01'))).toBe(52);
  expect(getWeekNumber(convertHtmlFormatToDate('2021-12-31'))).toBe(52);

  expect(getWeekNumber(convertHtmlFormatToDate('2024-01-01'))).toBe(1);
  expect(getWeekNumber(convertHtmlFormatToDate('2024-01-07'))).toBe(1);
  expect(getWeekNumber(convertHtmlFormatToDate('2024-01-08'))).toBe(2);
  expect(getWeekNumber(convertHtmlFormatToDate('2024-05-12'))).toBe(19);
  expect(getWeekNumber(convertHtmlFormatToDate('2024-05-13'))).toBe(20);
});

test('getGroupIdFromDate', () => {
  expect(getGroupIdFromDate(convertHtmlFormatToDate('2019-01-01'))).toBeLessThan(getGroupIdFromDate(convertHtmlFormatToDate('2019-12-31')));
  expect(getGroupIdFromDate(convertHtmlFormatToDate('2019-12-31'))).toBe(getGroupIdFromDate(convertHtmlFormatToDate('2020-01-01')));
  expect(getGroupIdFromDate(convertHtmlFormatToDate('2019-12-31'))).toBeLessThan(getGroupIdFromDate(convertHtmlFormatToDate('2020-01-08')));

  for (let i=0;i<100;i++) {
    expect(getGroupIdFromDate(convertHtmlFormatToDate(`${1975+i}-01-01`))).toBeLessThan(getGroupIdFromDate(convertHtmlFormatToDate(`${1975+i}-12-31`)));
    expect(getGroupIdFromDate(convertHtmlFormatToDate(`${1975+i}-12-31`))).toBeLessThan(getGroupIdFromDate(convertHtmlFormatToDate(`${1976+i}-01-08`)));
  }
});

test('getGroupIdFromDate globally unique weeks', () => {
  const next = (date:Date)=>new Date(date.getTime()+1000*60*60*24);
  let date = convertHtmlFormatToDate(`${1975}-07-03`);
  while(getDayName(date)!=='Mo') date = next(date);
  let prevValue=0;
  let currValue=0;
  for (let i=0;i<5000;i++) {
    currValue = getGroupIdFromDate(date);
    //console.log(i, date, getDayName(date) ,currValue);
    if (i>0) {
      if (i%7===0) {
        expect(prevValue).toBeLessThan(currValue);
      }
      else {
        expect(prevValue).toBe(currValue);
      }
    }
    prevValue = currValue;
    date = next(date);
  }
});

test('regression: weeknumber', () => {
  expect(getWeekNumber(convertHtmlFormatToDate('2024-05-12T00:00:00.000Z'))).toBe(19);
  expect(getWeekNumber(convertHtmlFormatToDate('2024-05-12T11:50:13.027Z'))).toBe(19);
  expect(getWeekNumber(convertHtmlFormatToDate('2024-05-12T23:59:59.999Z'))).toBe(19);
  expect(getWeekNumber(convertHtmlFormatToDate('2024-05-13T00:00:00.000Z'))).toBe(20);
});
