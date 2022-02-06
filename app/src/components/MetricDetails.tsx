import React, { useEffect, useState } from "react";
import { IMeasurement } from "../serverApi/IMeasurement";
import { envSettings } from "../env/envSettings";
import { useParams } from "react-router";
import { ServerApi } from "../serverApi/ServerApi";
import { MeasurementsList } from "./MeasurementsList";
import { MetricSummary } from "./MetricSummary";
import { PageTitle } from "./layout/PageTitle";
import { IMetric } from "../serverApi/IMetric";
import { Visualization } from "./chart/Visualization";
import { Section } from "./layout/Section";
import { PageHeader } from "./layout/PageHeader";

export const MetricDetails: React.FC = () => {
  const { metricKey } = useParams();

  const [metric, setMetric] = useState<IMetric>();
  const [measurements, setMeasurements] = useState<IMeasurement[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    const serverApi = new ServerApi(envSettings.apiBaseUrl);

    Promise.all([
      serverApi
        .getMeasurements(metricKey)
        .then(setMeasurements)
        .catch(handleError),
      serverApi.getMetric(metricKey).then(setMetric).catch(handleError),
    ]).then(() => setIsDataReady(true));
  }, []);

  if (!isDataReady) {
    return null;
  }

  return (
    <>
      <PageHeader>
        <PageTitle title={metric.name} />
      </PageHeader>

      <Section>
        <Visualization measurements={measurements} />
      </Section>
      <Section>
        <MetricSummary />
      </Section>
      <Section>
        <MeasurementsList measurements={measurements} />
      </Section>
      {errorMessage ? <div>{errorMessage}</div> : null}
    </>
  );

  function handleError(error: unknown) {
    setErrorMessage(typeof error === "string" ? error : JSON.stringify(error));
  }
};
