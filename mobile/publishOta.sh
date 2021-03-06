# Prepare Expo
npx expo login -u "$FI_EXPO_USERNAME" -p "$FI_EXPO_PASSWORD"
echo "fs.inotify.max_user_watches=524288" >> /etc/sysctl.conf && sysctl -p
echo "$FI_GOOGLE_SERVICES_APP" > google-services.json
DEVELOPER_ENV=${CI_COMMIT_REF_NAME:-"local"}

# Publish
echo "Publishing update ..."
MINUTES=$(printf "%05d" $((
        ($(date +%d | sed 's/^0//') -1) * 1440 +
        $(date +%H | sed 's/^0//') * 60 +
        $(date +%M | sed 's/^0//')
      )))
FI_VERSION="$(date +%y.%m.)${MINUTES}"
FI_VERSION_CODE="$(date +%y%m)${MINUTES}"
sed -i 's/integrates_version/'"${FI_VERSION}"'/g' ./app.json
sed -i "s/"\"versionCode\":" 0/"\"versionCode\":" ${FI_VERSION_CODE}/g" ./app.json

npx expo publish \
  --release-channel "$DEVELOPER_ENV" \
  --non-interactive

if [ ${FI_ROLLBAR_ENVIRONMENT:-""} = "production" ]; then
  curl https://api.rollbar.com/api/1/deploy/ \
    -F access_token="$ROLLBAR_ACCESS_TOKEN" \
    -F environment="mobile-production" \
    -F revision="$CI_COMMIT_SHA" \
    -F local_username="$CI_COMMIT_REF_NAME"
fi;

# Cleanup
echo "Published to Expo, cleaning up..."
npx expo logout
rm google-services.json
