// src/utils/financialCalculations.js
import { parseFinancialString, formatFinancialNumber } from './helpers';

export const calculateFinancialSummary = (dailyReports, previousData) => {
  const approvedReports = dailyReports.filter(report => report.approvalStatus === 'approved');
  
  const totalInspector1 = approvedReports.reduce((sum, report) => {
    const fee = parseFinancialString(report.inspectorFee);
    return sum + fee;
  }, 0);

  const totalInspector2 = approvedReports.reduce((sum, report) => {
    const fee = parseFinancialString(report.secondInspectorFee);
    return sum + fee;
  }, 0);

  const mainInspector = dailyReports[0]?.inspectorName || previousData?.inspectorInfo?.inspectorName || 'بازرس';
  const totalDays = dailyReports.length;
  const approvedDays = approvedReports.length;

  return {
    mainInspector,
    totalDays,
    approvedDays,
    totalInspector1: formatFinancialNumber(totalInspector1),
    totalInspector2: formatFinancialNumber(totalInspector2),
    grandTotal: formatFinancialNumber(totalInspector1 + totalInspector2),
    rawTotal1: totalInspector1,
    rawTotal2: totalInspector2
  };
};