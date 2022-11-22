import _ from 'lodash';
import { useRef } from 'react';
import { Dimensions } from 'react-native';
import { BigCard } from '../../components/BigCard';
import { RatingChart } from '../../components/RatingChart';
import { t } from '../../helpers/translation';
import { getRatingDistributionForXDays } from '../../hooks/useStatistics/RatingDistribution';
import { NotEnoughDataOverlay } from '../../components/Statistics/NotEnoughDataOverlay';
import { CardFeedback } from '../../components/Statistics/CardFeedback';

const MIN_ITEMS = 5;

export const RatingDistribution = ({
  date, items,
}) => {
  const data = getRatingDistributionForXDays(items, date, date.daysInMonth() - 1);

  const width = Dimensions.get('window').width - 80;
  const height = width / 2.5;

  const dataDummy = useRef(_.range(1, 30).map((i) => ({
    key: `${i}`,
    count: _.random(3, 6),
    value: _.random(1, 6),
  })))

  const validatedData = data.filter(d => d.value !== null)

  return (
    <BigCard
      title={t('statistics_rating_distribution')}
      subtitle={t('statistics_rating_distribution_description', { date: date.format('MMMM, YYYY') })}
      isShareable={true}
      analyticsId="rating-distribution"
    >
      {validatedData.length < MIN_ITEMS && (
        <NotEnoughDataOverlay limit={MIN_ITEMS - validatedData.length} />
      )}
      {validatedData.length >= MIN_ITEMS ? (
        <RatingChart
          data={data}
          height={height}
          width={width} />
      ) : (
        <RatingChart
          data={dataDummy.current}
          height={height}
          width={width} />
      )}
      <CardFeedback
        type='rating_distribution_month_report'
        details={data}
      />
    </BigCard>
  );
};
