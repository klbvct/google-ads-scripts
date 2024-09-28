function main() {
  // Получаем все видео-кампании
  var videoCampaigns = AdsApp.videoCampaigns().get();

  // Проверяем, есть ли видео-кампании
  if (!videoCampaigns.hasNext()) {
    Logger.log("Нет видео-кампаний.");
  } else {
    // Объект для хранения суммарных просмотров по группам объявлений
    var viewsByAdGroup = {};

    // Проходим по каждой видео-кампании
    while (videoCampaigns.hasNext()) {
      var campaign = videoCampaigns.next();

      // Проверяем, активна ли кампания
      if (campaign.isEnabled()) {
        // Получаем все группы объявлений для текущей видео-кампании
        var adGroups = campaign.videoAdGroups().get(); // Используем метод videoAdGroups()

        // Проверяем, есть ли группы объявлений
        if (adGroups.hasNext()) {
          // Проходим по каждой группе объявлений
          while (adGroups.hasNext()) {
            var adGroup = adGroups.next();

            // Проверяем, активна ли группа объявлений
            if (adGroup.isEnabled()) {
              var adGroupName = adGroup.getName();

              // Получаем статистику за текущий месяц для группы объявлений
              var stats = adGroup.getStatsFor("THIS_MONTH");
              var views = stats.getViews(); // Получаем количество просмотров

              // Суммируем просмотры по названиям групп
              if (viewsByAdGroup[adGroupName]) {
                viewsByAdGroup[adGroupName] += views;
              } else {
                viewsByAdGroup[adGroupName] = views;
              }
            }
          }
        }
      }
    }

    // Выводим суммарные показатели просмотров по группам объявлений и ставим на паузу, если нужно
    Logger.log("Суммарные показатели просмотров по группам объявлений:");
    for (var group in viewsByAdGroup) {
      Logger.log("Группа объявлений: " + group + ", Суммарные просмотры: " + viewsByAdGroup[group]);

      // Проверяем, превышает ли сумма просмотров 11200
      if (viewsByAdGroup[group] > 11200) {
        // Получаем все группы с данным именем для установки на паузу
        var adGroupsToPause = AdsApp.videoAdGroups()
          .withCondition("Name = '" + group.replace(/'/g, "\\'") + "'") // Экранируем одинарные кавычки
          .get();

        // Ставим на паузу все соответствующие группы объявлений
        while (adGroupsToPause.hasNext()) {
          var adGroupToPause = adGroupsToPause.next();
          adGroupToPause.pause(); // Пауза группы
          Logger.log("  Группа объявлений '" + group + "' поставлена на паузу.");
        }
      }
    }
  }
}
