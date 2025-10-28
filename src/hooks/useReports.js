// src/hooks/useReports.js
import { useState, useEffect } from 'react';

export const useReports = (initialReports = [], onListChange) => {
  const [reports, setReports] = useState(initialReports);
  const [lastReportNumber, setLastReportNumber] = useState(2000);

  useEffect(() => {
    if (initialReports.length > 0) {
      setReports(initialReports);
      const maxNumber = Math.max(...initialReports.map(r => r.number));
      setLastReportNumber(maxNumber);
    }
  }, [initialReports]);

  const addReport = (report) => {
    const newReports = [report, ...reports];
    setReports(newReports);
    setLastReportNumber(report.number);
    
    if (onListChange?.addToList) {
      onListChange.addToList('reports', report);
    }
  };

  const updateReport = (reportId, updates) => {
    const updatedReports = reports.map(report => 
      report.id === reportId ? { ...report, ...updates } : report
    );
    setReports(updatedReports);
    
    if (onListChange?.updateListItem) {
      onListChange.updateListItem('reports', reportId, updates);
    }
  };

  const deleteReport = (reportId) => {
    const filteredReports = reports.filter(report => report.id !== reportId);
    setReports(filteredReports);
    
    if (onListChange?.removeFromList) {
      onListChange.removeFromList('reports', reportId);
    }
  };

  return {
    reports,
    lastReportNumber,
    addReport,
    updateReport,
    deleteReport
  };
};