import React from 'react';
import { Card, CardHeader, CardPreview, CardFooter, Button, Title3, Subtitle2 } from '@fluentui/react-components';
import ScrollToTop from './ScrollToTop';
import { LikeButton } from './LikeButton';
import { C60 } from './C60';

export type SingleActionsProps = {
  containerSelector?: string;
};

export const SingleActions: React.FC<SingleActionsProps> = (props) => {
  return (
    <div className="single-actions-wrapper">
      <Card appearance="filled" className="single-actions-card">
        <CardHeader
          header={<Title3>Interactive C60 Model</Title3>}
          description={<Subtitle2>Fluent-styled card with actions</Subtitle2>}
        />
        <CardPreview>
          <div className="single-actions-preview">
            <C60 containerSelector={props.containerSelector} />
          </div>
        </CardPreview>
        <CardFooter>
          <div className="single-actions-footer">
            <Button appearance="primary">Primary Action</Button>
            <Button appearance="secondary">Secondary</Button>
            <LikeButton />
            <ScrollToTop />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SingleActions;
