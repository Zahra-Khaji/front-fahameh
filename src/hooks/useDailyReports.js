// src/hooks/useDailyReports.js
import { useState, useEffect } from 'react';
import { getDatesInRange } from '../utils/helpers';
import { calculateFinancialSummary } from '../utils/financialCalculations';

export const useDailyReports = (previousData, initialDailyReports = []) => {
  const [dailyReports, setDailyReports] = useState([]);

  // Initialize daily reports
  useEffect(() => {
    if (initialDailyReports.length > 0) {
      setDailyReports(initialDailyReports);
      return;
    }

    const defaultInspector = previousData?.inspectorInfo?.inspectorName || '';
    const defaultFee = previousData?.inspectorInfo?.fee || '';
    
    // Get real inspection range from previous data
    const getRealInspectionRange = () => {
      if (previousData?.notifications && previousData.notifications.length > 0) {
        const notification = previousData.notifications[0];
        if (notification.inspectionRange && Array.isArray(notification.inspectionRange) && notification.inspectionRange.length === 2) {
          return notification.inspectionRange;
        }
      }
      
      if (previousData?.inspectionRange && Array.isArray(previousData.inspectionRange) && previousData.inspectionRange.length === 2) {
        return previousData.inspectionRange;
      }
      
      // Fallback to sample dates
      return [
        new Date('2024-10-13'),
        new Date('2024-10-15')
      ];
    };

    const realInspectionRange = getRealInspectionRange();
    const dates = getDatesInRange(realInspectionRange[0], realInspectionRange[1]);
    
    const reports = dates.map((date, index) => ({
      id: Date.now() + index,
      inspectionDate: date,
      approvalStatus: 'approved',
      inspectorName: defaultInspector,
      inspectorFee: defaultFee,
      secondInspectorName: '',
      secondInspectorFee: ''
    }));

    setDailyReports(reports);
  }, [previousData, initialDailyReports]);

  const updateDailyReport = (reportId, field, value) => {
    setDailyReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, [field]: value }
          : report
      )
    );
  };

  const validateForm = () => {
    return dailyReports.every(report => 
      report.approvalStatus && 
      report.inspectorName && 
      report.inspectorFee
    );
  };

  const summary = calculateFinancialSummary(dailyReports, previousData);

  return {
    dailyReports,
    updateDailyReport,
    summary,
    validateForm
  };
};