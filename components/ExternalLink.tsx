import { Link, type LinkProps } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Platform } from 'react-native';

type Props = Omit<LinkProps, 'href'> & {
  href: LinkProps['href'];
};

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      {...rest}
      href={href}
      target="_blank"
      onPress={(e) => {
        if (Platform.OS !== 'web') {
          e.preventDefault();
          WebBrowser.openBrowserAsync(String(href));
        }
      }}
    />
  );
}
