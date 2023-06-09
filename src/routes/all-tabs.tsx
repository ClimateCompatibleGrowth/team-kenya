import { TabContext, TabList } from '@mui/lab';
import { Box, Tab, Toolbar } from '@mui/material';
import { object } from '@recoiljs/refine';
import { Outlet, useParams } from 'react-router';
import { Link } from 'react-router-dom';

import { queryJson } from '../data/fetch/load-file';
import { allDataSourcesChecker } from '../data/fetch/models/data-source';
import { allDataTabsChecker } from '../data/fetch/models/data-tab';
import { allDataSourcesState } from '../sections/data-tab/data-source-state';
import { allTabsState } from '../sections/data-tab/data-tab-state';
import { StateSetter } from '../utils/recoil/StateSetter';
import { MutableCheckerReturn } from '../utils/recoil/refine';
import { TypedLoaderFunction, useCheckedLoaderData } from '../utils/router';

const dataViewDataChecker = object({
  dataTabs: allDataTabsChecker,
  dataSources: allDataSourcesChecker,
});

type DataViewData = MutableCheckerReturn<typeof dataViewDataChecker>;

export const dataViewLoader: TypedLoaderFunction<DataViewData> = async ({
  request,
}) => {
  return {
    dataTabs: await queryJson('/config/data-tabs.json', request.signal),
    dataSources: await queryJson('/config/data-sources.json', request.signal),
  };
};

export const AllTabsRoute = () => {
  const { tab } = useParams() as { tab: string };
  const { dataTabs, dataSources } = useCheckedLoaderData(dataViewDataChecker);

  return (
    <>
      <StateSetter value={dataTabs} state={allTabsState} />
      <StateSetter value={dataSources} state={allDataSourcesState} />
      <Box height="100vh" maxHeight="100vh">
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabContext value={tab}>
            <TabList
              variant="scrollable"
              TabIndicatorProps={{ style: { transition: 'none' } }}
            >
              {dataTabs.map(({ slug, label }) => (
                <Tab
                  key={slug}
                  label={label}
                  value={slug}
                  component={Link}
                  to={slug}
                />
              ))}
            </TabList>
          </TabContext>
        </Toolbar>
        <Outlet />
      </Box>
    </>
  );
};
