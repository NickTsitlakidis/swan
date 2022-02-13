import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import 'Screens/homepage.dart';

void main() {
  runApp(const ProviderScope(child: WidgetTree()));
}

class WidgetTree extends HookConsumerWidget {
  const WidgetTree({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {

    return MaterialApp(
        title: 'Solana Dapp Flutter Demo',
        theme: ThemeData.dark(),
        home: const HomePage(),
        );
  }
}
