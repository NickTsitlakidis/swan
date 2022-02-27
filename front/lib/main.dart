import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:nft_game/Screens/wallet_info.dart';

import 'Providers/auth.dart';
import 'Screens/homepage.dart';

void main() async {
  await dotenv.load(fileName: '.env');
  runApp(const ProviderScope(child: WidgetTree()));
}

class WidgetTree extends HookConsumerWidget {
  const WidgetTree({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final _auth = Auth();
    _auth.clientLogin(ref);
    return MaterialApp(
        title: 'Solana NFT Dapp PoC',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          splashColor: Colors.transparent,
          fontFamily: 'Montserrat',
          scaffoldBackgroundColor: Colors.black45,
          primarySwatch: Colors.blueGrey,
          appBarTheme: const AppBarTheme(
            systemOverlayStyle: SystemUiOverlayStyle(
              statusBarColor: Colors.transparent,
              statusBarBrightness: Brightness.light,
              statusBarIconBrightness: Brightness.dark,
            ),
          ),
        ),
        home: const HomePage(),
        routes: {
          HomePage.routeName: (ctx) => const HomePage(),
          WalletInfo.routeName: (ctx) => const WalletInfo(),
        });
  }
}
