import React from 'react';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';
import DetailsCompareTaskSpatialRight from "./DetailsCompareTaskSpatialRight";
import DetailsCompareTaskSpatialLeft from "./DetailsCompareTaskSpatialLeft";
import CompareSpatialTaskTopBar from "./CompareTaskSpatialTopBar";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: ${({ isMobile }) => (isMobile ? '92vh' : '100vh')};
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
  flex-direction: row;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 0 20px;
    overflow-y: auto;
  }
`;

const Spacer = styled.div`
  width: 10px;

  @media (max-width: 768px) {
    width: 0;
    height: 5px;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  overflow: auto;
  margin: 0;
`;

const CompareSpatialTask = () => (
    <Container isMobile={isMobile}>
        <CompareSpatialTaskTopBar />
        <MainContent>
            <ContentWrapper>
                <DetailsCompareTaskSpatialLeft />
            </ContentWrapper>
            <Spacer />
            <ContentWrapper>

                <DetailsCompareTaskSpatialRight />
            </ContentWrapper>
        </MainContent>
    </Container>
);

export default React.memo(CompareSpatialTask);
