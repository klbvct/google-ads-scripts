// Скрипт проверяет ключевые слова в кампаниях и сравнивать их с данными в Google Sheets, приостанавливая те, которые отсутствуют в таблице (Файл содержит листы с названием кампаний Google Ads)
function main() {
    var spreadsheetId = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Вставьте ID вашей таблицы Google Sheets
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // Получаем все активные кампании Google Ads
    var campaigns = AdsApp.campaigns().withCondition("Status = ENABLED").get();
    
    while (campaigns.hasNext()) {
      var campaign = campaigns.next();
      var campaignName = campaign.getName();
  
      // Пытаемся получить лист с названием кампании из Google Sheets
      var sheet = spreadsheet.getSheetByName(campaignName);
      if (!sheet) {
        Logger.log("Лист с названием кампании '" + campaignName + "' не найден в таблице Google Sheets.");
        continue;
      }
      
      // Получаем ключевые слова из всех ячеек листа
      var sheetKeywords = getKeywordsFromSheet(sheet);
      
      // Получаем ключевые слова кампании из Google Ads
      var adGroupIterator = campaign.adGroups().get();
      while (adGroupIterator.hasNext()) {
        var adGroup = adGroupIterator.next();
        var keywordIterator = adGroup.keywords().get();
  
        while (keywordIterator.hasNext()) {
          var keyword = keywordIterator.next();
          var keywordText = keyword.getText();
          
          // Сравниваем ключевое слово с Google Sheets
          if (!sheetKeywords.includes(keywordText)) {
            keyword.pause(); // Если ключевое слово не найдено в таблице, приостанавливаем его
            Logger.log("Ключевое слово '" + keywordText + "' в кампании '" + campaignName + "' приостановлено, так как его нет в Google Sheets.");
          }
        }
      }
    }
  }
  
  // Функция для получения всех ключевых слов с листа Google Sheets
  function getKeywordsFromSheet(sheet) {
    var range = sheet.getDataRange(); // Получаем все данные листа
    var values = range.getValues();
    
    // Преобразуем массив в список ключевых слов
    var keywords = [];
    for (var i = 0; i < values.length; i++) {
      for (var j = 0; j < values[i].length; j++) {
        var keyword = values[i][j].trim();
        if (keyword) {
          keywords.push(keyword);
        }
      }
    }
    
    return keywords;
  }
  