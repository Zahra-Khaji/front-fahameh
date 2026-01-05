const handleConfirmRowSave = () => {
    if (!selectedRowForSave || !rowToSaveData) return;
  
    const rowPayload = {
      rfiNumber: rowToSaveData.rfiNumbering,
      rowData: {
        approveManday: rowToSaveData.approveManday,
        idrd: rowToSaveData.idrd,
        fee: rowToSaveData.fee,
      },
    };
  
    updateNotificationRow(rowPayload, {
      onSuccess: (data) => {
        // 1. بستن پاپ‌آپ
        setShowRowSaveConfirm(false);
  
        // 2. ذخیره rowId برای فیدبک UI
        const savedRowId = selectedRowForSave;
        setSelectedRowForSave(null);
        setRowToSaveData(null);
  
        // 3. آپدیت initialDataRef.current با مقادیر جدید
        if (initialDataRef.current) {
          initialDataRef.current = {
            ...initialDataRef.current,
            rfiDatesRows: initialDataRef.current.rfiDatesRows.map((row) => {
              if (row.id === savedRowId) {
                // پیدا کردن ردیف فعلی
                const currentRow = rfiDatesRows.find(r => r.id === savedRowId);
                return {
                  ...row,
                  approveManday: currentRow?.approveManday || row.approveManday,
                  fee: currentRow?.fee || row.fee,
                  inspectorName: currentRow?.inspectorName || row.inspectorName,
                  inspectionDate: currentRow?.inspectionDate?.format?.() || row.inspectionDate,
                };
              }
              return row;
            }),
          };
        }
  
        // 4. فیدبک فوری UI - سطر را highlight کن
        setRfiDatesRows((prevRows) =>
          prevRows.map((row) => {
            if (row.id === savedRowId) {
              return {
                ...row,
                _saved: true,
                _savedAt: new Date().toISOString(),
              };
            }
            return row;
          })
        );
  
        // 5. فوراً وضعیت hasChanges را بررسی و آپدیت کن
        setHasChanges(false); // ابتدا false کن
        
        // 6. کمی تاخیر برای اطمینان از آپدیت stateها
        setTimeout(() => {
          const changed = checkForChanges();
          setHasChanges(changed);
          console.log('🔍 پس از ذخیره، وضعیت تغییرات:', changed);
        }, 100);
  
        // 7. نمایش toast موفقیت
        toast.success("تغییرات با موفقیت ذخیره شد", {
          position: "top-center",
          duration: 2000,
          icon: "✅",
          style: {
            background: "#10b981",
            color: "white",
            borderRadius: "8px",
            padding: "12px",
            fontSize: "14px",
          },
        });
  
        // 8. پس از 3 ثانیه highlight را بردار
        setTimeout(() => {
          setRfiDatesRows((prevRows) =>
            prevRows.map((row) => ({
              ...row,
              _saved: false,
            }))
          );
        }, 3000);
      },
      onError: (error) => {
        console.error("❌ Row save failed:", error);
  
        toast.error(
          `❌ خطا در ذخیره: ${
            error.response?.data?.message || "لطفا مجدد تلاش کنید"
          }`,
          {
            position: "top-center",
            duration: 3000,
            icon: "❌",
            style: {
              background: "#ef4444",
              color: "white",
              borderRadius: "8px",
              padding: "12px",
              fontSize: "14px",
            },
          }
        );
  
        setShowRowSaveConfirm(false);
      },
    });
  };