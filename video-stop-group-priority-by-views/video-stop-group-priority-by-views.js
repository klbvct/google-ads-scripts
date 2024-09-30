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
  
        // Проверяем, активна ли кампания или на паузе
        if (campaign.isEnabled() || campaign.isPaused()) {
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
  
                // Проверяем метку группы и ставим лимиты просмотров в зависимости от важности (P1, P2, P3)
                var labels = adGroup.labels().get();
                var priority = null;
  
                while (labels.hasNext()) {
                  var label = labels.next().getName();
                  if (label === "P1" || label === "P2" || label === "P3") {
                    priority = label;
                    break;
                  }
                }
  
                if (priority) {
                  // Суммируем просмотры по названиям групп
                  if (!viewsByAdGroup[adGroupName]) {
                    viewsByAdGroup[adGroupName] = {
                      views: 0,
                      priority: priority
                    };
                  }
                  viewsByAdGroup[adGroupName].views += views;
                }
              }
            }
          }
        }
      }
  
      // Выводим суммарные показатели просмотров по группам объявлений и ставим на паузу, если нужно
      Logger.log("Суммарные показатели просмотров по группам объявлений:");
      for (var group in viewsByAdGroup) {
        var totalViews = viewsByAdGroup[group].views;
        var priority = viewsByAdGroup[group].priority;
        Logger.log("Группа объявлений: " + group + ", Суммарные просмотры: " + totalViews + ", Метка: " + priority);
  
        // Логика для паузы групп в зависимости от метки
        var pauseThreshold = 0;
        if (priority === "P1" && totalViews > 10000) {
          pauseThreshold = 10000;
        } else if (priority === "P2" && totalViews > 7000) {
          pauseThreshold = 7000;
        } else if (priority === "P3" && totalViews > 2500) {
          pauseThreshold = 2500;
        }
  
        // Если нужно поставить на паузу
        if (pauseThreshold > 0) {
          // Получаем все группы с данным именем для установки на паузу
          var adGroupsToPause = AdsApp.videoAdGroups()
            .withCondition("Name = '" + group.replace(/'/g, "\\'") + "'")
            .get();
  
          // Ставим на паузу все соответствующие группы объявлений
          while (adGroupsToPause.hasNext()) {
            var adGroupToPause = adGroupsToPause.next();
            adGroupToPause.pause(); // Пауза группы
            Logger.log("  Группа объявлений '" + group + "' с меткой '" + priority + "' поставлена на паузу. Просмотры: " + totalViews);
          }
        }
      }
    }
  }
  