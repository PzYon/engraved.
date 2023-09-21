import { UpsertMeasurement } from "./UpsertMeasurement";
import { IDialogProps } from "../../layout/dialogs/DialogContext";
import { IMetric } from "../../../serverApi/IMetric";
import React from "react";
import { useActiveMeasurementQuery } from "../../../serverApi/reactQuery/queries/useActiveMeasurementQuery";
import { MetricType } from "../../../serverApi/MetricType";
import { renderAddScrapDialog } from "./renderAddScrapDialog";

export const renderUpsertMeasurementDialog = (
  metric: IMetric,
  renderDialog: (dialogProps: IDialogProps) => void
): void => {
  if (metric.type === MetricType.Scraps) {
    renderAddScrapDialog(metric.id, renderDialog, "Add scrap");
    return;
  }

  renderDialog({
    title: "Add measurement",
    render: (closeDialog) => (
      <UpsertMeasurementWrapper
        metric={metric}
        onSaved={() => renderDialog(null)}
        onCancel={closeDialog}
      />
    ),
  });
};

const UpsertMeasurementWrapper: React.FC<{
  metric: IMetric;
  onSaved: () => void;
  onCancel: () => void;
}> = ({ metric, onSaved, onCancel }) => {
  const measurement = useActiveMeasurementQuery(metric);
  if (measurement === undefined) {
    return null;
  }

  return (
    <UpsertMeasurement
      metric={metric}
      measurement={measurement}
      onSaved={onSaved}
      onCancel={onCancel}
    />
  );
};
