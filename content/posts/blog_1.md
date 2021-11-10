---
title: Introduction to information theoretic measures
date: '2021-11-09'
draft: yes
bibFile : static/bib.json
---

The mutual information is a measure of the dependency between two random
variables in the most general sense. It is agnostic to the nature of the
random variables and of their relationship : noted
$\operatorname{I}(X;Y)$, it simply defines the quantity of information
one knows about $X$ by knowing $Y$, and vice-versa. It was introduced by
Claude Shannon in 1948 to characterize communication channels
{{<cite "shannon_mathematical_1948">}} but it has found success in a wide range of
applications since. It is still seen by many as the ideal dependency
measure, although it is difficult to use in practice.

{{< figure src="/media/dependencies.png" title="Examples of dependencies : $X \indep Y \Leftrightarrow p(X,Y) \not= p(X)p(Y)$" >}}


## Definitions {#sec:mutual_info_definition}

### Entropy and mutual information

Before giving the definition of the mutual information between two
random variables, it is a good idea to start with the self-information
contained in a single variable, called the entropy. Let $X$ be a
discrete random variable with possible values in $\mathcal{X}$ and a
probability mass function $p(x) = Pr\{X = x\}, x \in \mathcal{X}$. The
entropy $\operatorname{H}(X)$ of $X$ is defined by :

$$\operatorname{H}(X) = - \sum_{x \in \mathcal{X}}p(x)\log p(x)$$

It is expressed in *bits* with a logarithm to the base 2, or *nats* with
the base $e$, and it denotes the average information or \"surprise\"
that is carried by a random variable. To get a better understanding of
this concept, consider a game of chance where you try to predict the
result of a coin flip. If the coin is balanced, each realisation has the
same \"surprise\" as both outcomes, heads or tails, are equiprobable.
When the coin is biased towards one outcome with probability $p$, the
average surprise decreases as $p$ approaches $0$ or $1$ at which point
it becomes null and your willingness to bet on the outcome increases.
Note that the entropy characterises the distribution of a random
variable and not the surprise of one realisation.

This definition can be naturally extended to a pair of random variables
$X$ and $Y$ (which can be thought of a single two-dimensional variable),
giving the *joint entropy* :

$$\operatorname{H}(X,Y) = - \sum_{x \in \mathcal{X}} \sum_{y \in \mathcal{Y}}p(x,y)\log p(x,y)$$

We can also define the *conditional entropy*, i.e. the expected
\"surprise\" of the conditional distribution of a variable $Y$ given $X$
:

$$\operatorname{H}(Y|X) = - \sum_{x \in \mathcal{X}} \sum_{y \in \mathcal{Y}} p(x,y){\log\frac{p(x,y)}{p(x)}}$$

One desirable property of these information-theoretic values is that
they can be combined in an intuitive manner with the \"chain rule\" :

$$\begin{aligned}
    \operatorname{H}(X,Y) = \operatorname{H}(X) + \operatorname{H}(Y|X)\\\
    \operatorname{H}(Y|X) = \operatorname{H}(X,Y) - \operatorname{H}(X)
\end{aligned}$$

Indeed, it comes easily to think of the joint entropy of $X$ and $Y$ as
the sum of the information carried by $X$ plus the residual information
of $Y$ after \"removing\" the knowledge of $X$, as some information may
be redundant between the two.

So far we have only defined the entropy of discrete variables, but our
ideal dependency measure should also include continuous or mixed (part
discrete, part continuous) distributions which are present in real-life
datasets. Continuous variables are defined by a probability density
function $f(x)$ instead of a mass function, which was naturally
considered by Shannon to be equivalent in the definition for their
entropy. There are however subtle differences with the discrete
counterpart, which is why this value is called the *differential*
entropy and is noted $h(X)$ :

$$h(X) = -\int_{S} f(x)\log f(x)\,dx ,$$

with $S$ as the support set of $X$ where $f(x) > 0$.

The source of the differences between differential and discrete
entropies becomes evident with our previous example of predicting the
value of a random variable : what is the surprise of a realisation of
$X$ given that there is an infinite number of possible values in any
continuous interval, each with a probability that tends to $0$ ?

It is better to think of the differential entropy as an estimate of the
effective volume that a random variable occupies : a very focused
distribution will have a low entropy as opposed to a more dispersed
distribution with more *room* for randomness hence higher entropy.
Formally, the differential entropy is the logarithm of the length of the
smallest interval that contains most of the probability
{{<cite "cover_elements_2012">}} : for example, the differential entropy of a
uniform distribution on the interval $[0,a]$ is $\log(a)$.

Although the differences between entropy and differential entropy go
beyond the scope of this thesis, it is still interesting to mention them
to understand why discretization has been so popular for so long to
estimate the entropy or mutual information between samples of continuous
variables. Even though, as we will see in sections
[\[sec:continuous_estimators\]](#sec:continuous_estimators){reference-type="ref"
reference="sec:continuous_estimators"} and
[\[sec:miic_estimator\]](#sec:miic_estimator){reference-type="ref"
reference="sec:miic_estimator"}, one must be careful to discretize a
continuous variable without introducing bias.

Entropy and differential entropy behave similarly and are
interchangeable in the settings that interest us, namely for the joint
and conditional differential entropy, the chain rule and especially the
relationship to mutual information. For the rest of section
[1.1](#sec:mutual_info_definition){reference-type="ref"
reference="sec:mutual_info_definition"}, the probability mass function
$p(x)$ can be replaced by the density function $f(x)$, and $H(X)$ by
$h(X)$ to switch from discrete to continuous random variables. The
special case of mixed variables with both continuous and discrete parts
will be reviewed at a the end of this section.

We have established that information theory gives us the necessary tools
to define the entropy of a random variable (which can be
multidimensional or conditional), i.e. the amount of information needed
on average to describe it. Next we show how we can also formalize how
much information two variables have in common, giving a measure of how
(in)dependent they are. For this we need to introduce the
Kullback-Leibler divergence, also called the *relative entropy*. The
relative entropy $D_\text{KL}(p \parallel q)$ is a measure of the
difference between two distributions $p$ and $q$ defined on the same
space $\mathcal{X}$:

$$\label{eq:KL_def}
    D_\text{KL}(p\parallel q) = \sum_{x \in \mathcal{X}} p(x) \log \frac{p(x)}{q(x)}$$

Also called the Kullback-Leibler distance (although not a distance in
the usual sense as it is not symmetric), it can thought of as the cost
of describing the distribution $p$ when using $q$ as a reference model.
As such, it is null if and only if $p = q$ and it is always
non-negative.

Now we get back to our original goal which is to define the dependency
between two random variables $X$ and $Y$. In the most general sense, $X$
and $Y$ are independent if the realization of one does not affect the
probability distribution of the other. Formally put, two random
variables $X$ and $Y$ with marginal distributions $p(x)$, $p(y)$ and a
joint distribution $p(x,y)$ are independent if and only if
$p(x,y) = p(x)p(y)$. If these two quantities differ, some information is
being shared between $X$ and $Y$ : knowing about $X$ tells us
*something* about $Y$ and vice versa.

Using the measure of divergence we just introduced, it becomes natural
to think of the divergence between the joint distribution and the
product of marginals as a direct measure of the dependency. It is in
fact the definition of the mutual information $\operatorname{I}(X;Y)$ :
$$\begin{aligned}
    \operatorname{I}(X;Y) &= D_\text{KL}\left(p(x,y) \parallel p(x) p(y)\right) \label{eq:discrete_mi_kl}\\\
             &= \sum_{y \in Y} \sum_{x \in X} { p(x,y) \log{ \left(\frac{p(x,y)}{p(x)\,p(y)} \right) }} \label{eq:discrete_mi_sum}
\end{aligned}$$

In agreement with our interpretation of the relative entropy, assuming
the independence model where $p(x,y)=p(x)p(y)$ the mutual information is
literally *the extra bits* that are required to encode the interaction
between $X$ and $Y$. It is always positive, or null if and only if $X$
and $Y$ are independent.

Just like the other measures, it fits naturally in the \"chain rule\"
and can be expressed intuitively in terms of entropies (Fig
[\[fig:entropy_mutual_info\]](#fig:entropy_mutual_info){reference-type="ref"
reference="fig:entropy_mutual_info"}):

$$\begin{aligned} \label{eq:I_H_chainrule}
    \operatorname{I}(X;Y) &= \operatorname{H}(X) - \operatorname{H}(X|Y) \\\
             &= \operatorname{H}(Y) - \operatorname{H}(Y|X) \\\
             &= \operatorname{H}(X) + \operatorname{H}(Y) - \operatorname{H}(X,Y)
\end{aligned}$$

What makes the mutual information a particularly interesting measure is
its unique blend of desirable properties.

First, it satisfies the Data Processing Inequality (DPI) which states
that one cannot increase the information content of a signal by
processing it. Formally, if $n$ variables form a Markov chain
$X_0 \rightarrow X_1 \rightarrow \cdots \rightarrow X_n$, then
$\operatorname{I}(X_i;X_j) \ge \operatorname{I}(X_i; X_k)$ with
$i < j < k$.

In relation to the first point, mutual information is also widely
considered to be equally sensitive to all types of relationships. This
concept was termed \"equitablity\" by Reshef et al.
{{<cite "reshef_detecting_2011">}} (although in a flawed form) and was then
formally investigated by Kinney et Atwal {{<cite "kinney_equitability_2014">}}.
Kinney et Atwal's \"Self-Equitability\" is defined to characterize a
dependence measure $D[X;Y]$ if and only if it is symmetric between $X$
and $Y$, and : $$D[X;Y] = D[f(X);Y]$$ with $f$ any deterministic
function, $X \leftrightarrow f(X) \leftrightarrow Y$ forming a Markov
chain. Put roughly, an equitable measure means that one can measure the
strength of the signal (as compared to the noise) between $Y$ and $f(X)$
without having to know the underlying function $f$.

Not only is it invariant to invertible transformations of $X$ and $Y$,
it is also invariant under any monotonic (i.e. rank preserving)
transformations.

Put together, these three properties make the mutual information particularly interesting for general case causal discovery. True causal discovery should make no assumption of the natural mechanisms that produced the observed data, whether on the scale of the unit or shape of the joint distributions. As a simple example, a case can be made to measure the human weight in a logarithmic scale instead of a linear one : for most health related aspects, a difference of 30 kilograms is much more significant between 60 and 90kgs than between 120 and 150kgs.
In an experimental context, we can think of the causal diagram as the
natural laws that have produced the observations, which are themselves a
function of the \"observing\" process. The self-equitability property
and invariance under transformation go some way towards freeing
ourselves from this observation process and our own biases.

Finally, as will be discussed later, these properties hold for any type
of variable $X$ and $Y$, be it continuous, discrete (ordinal or not), or
a mixture of discrete and continuous parts.

A notable disadvantage of mutual information compared to other measures
is that the *bit*, unit of information, is not commonly understood, and
the fact that it is unbounded upwards. One usually cannot easily derive
a p-value from a mutual information estimation on sampled data, which
makes it harder to communicate (although the benefits of standardising
the p-value have been called into question
{{<cite "amrhein_scientists_2019;leek_five_2017">}}). Different ideas to
evaluate significativity will be presented in Section
[\[sec:mi_estimators\]](#sec:mi_estimators){reference-type="ref"
reference="sec:mi_estimators"}, but for now we are only interested in
the \"oracle\" value, when the sample size $N$ tends to infinity and the
strict equivalence
$X \indep Y \leftrightarrow \operatorname{I}(X;Y) = 0$
holds.

In the discrete case, its value is actually familiar as it is in fact
the G-statistic multiplied by a factor of $N$. With $O_i$ the number of
observations in a contingency table between two categorical variables
$X$ and $Y$, with $i$ joint levels, and $E_i$ the expected counts under
the null hypothesis
$X \indep Y$, the G-statistic
is defined as : $$G = 2 \sum_i O_i \log\left(\frac{O_i}{E_i}\right)$$

Recall the definition of the KL divergence (Eq
[\[eq:KL_def\]](#eq:KL_def){reference-type="ref"
reference="eq:KL_def"}), the same formula as above except for the
frequencies (noted $o_i$ and $e_i$) instead of the *counts* $O_i$,
$E_i$. Using the frequencies, the G-statistic becomes :
$$\begin{aligned}
    \begin{split}
    G &= 2N \sum_i o_i \log\left(\frac{o_i}{e_i}\right)\\\
      &= 2N \cdot D_\text{KL}(o\parallel e)\\\
      &= 2N \cdot \operatorname{I}(X;Y)
    \end{split}
\end{aligned}$$ It also follows that the mutual information is related
to the $\chi^2$ test, as it is itself a second-order Taylor
approximation of the G-statistic.

For two continuous variables, it may be harder to get a good intuition
of what the mutual information measures. A first property that may seem
odd is that if $X$ is continuous and $Y=X$, then
$\operatorname{I}(X;Y) = \infty$. This looks as though it contradicts
the chain rule (Eq
[\[eq:I_H\_chainrule\]](#eq:I_H_chainrule){reference-type="ref"
reference="eq:I_H_chainrule"}), since it implies that
$\operatorname{H}(X)-\operatorname{H}(X|X) = \infty$. It is in fact one
of the differences between entropy $\operatorname{H}$ and differential
entropy $h$ which is unbounded in the case of a singularity
$h(X|X) = - \infty$, unlike $\operatorname{H}$ which is always finite.
Thankfully, this theoretical property does not bleed into the real world
for several reasons : first, even continuous distributions have always
finite differential entropies since we actually treat real numbers up to
a finite number of significant digits. Second, much like a correlation
coefficient on observed data never reaches $1$, we should not ever need
to estimate $\operatorname{I}(X;Y)$ where $X=Y$. The analytical value of
the mutual information on a bivariate Gaussian with correlation
coefficient $\rho$ is actually known :

$$\label{eq:mi_gaussian}
    \operatorname{I}(X;Y) = -\frac{1}{2}\log(1 - \rho^2)$$

This equivalence is useful for practitioners who are unfamiliar with
mutual information and wish to translate it to the better known
dependence measure : thanks the self-equitability property if one could
transform two variables to a bivariate Gaussian distribution preserving
the signal-to-noise ratio, using Eq
[\[eq:mi_gaussian\]](#eq:mi_gaussian){reference-type="ref"
reference="eq:mi_gaussian"} one could then get the corresponding
correlation coefficient (see Fig
[\[fig:mi_value_gaussian\]](#fig:mi_value_gaussian){reference-type="ref"
reference="fig:mi_value_gaussian"}).

### Conditional information and interaction information

Information theory also allows us to measure the conditional dependence
between two variables $X$ and $Y$ given a third, $Z$. The conditional
mutual information is defined as the expected value of the mutual
information between $X$ and $Y$ given a third variable $Z$:
$$\begin{aligned}
    \operatorname{I}(X;Y|Z) &= \mathbb{E}_z\left[D_\text{KL}\left(p((x,y)|z) \parallel p(x|z) p(y|z)\right)\right]
\end{aligned}$$

It is symmetrically decomposable into two-points mutual informations :
$$\begin{aligned}
    \begin{split}
    \operatorname{I}(X;Y|Z) &= \operatorname{I}(X;Y,Z) - \operatorname{I}(X;Z)\\\
               &= \operatorname{I}(Y;X,Z) - \operatorname{I}(Y;Z)
    \end{split}
\end{aligned}$$

where $X,Z$ and $Y,Z$ are joint variables. The conditional mutual
information can only be positive, or null if and only if
$X \indep Y | Z$.

Finally, the information between more than two variables is called the
interaction information. We define it for three variables $X,Y,Z$ and a
conditioning set $U_i$ : $$\begin{aligned} \label{eq:cond_chain_rule}
    \begin{split}
        \operatorname{I}(X;Y;Z|\{U_i\}) &= I(X;Y|\{U_i\}) - I(X;Y|\{U_i\}, Z)\\\
                           &= I(X;Z|\{U_i\}) - I(X;Z|\{U_i\}, Y)\\\
                           &= I(Y;Z|\{U_i\}) - I(Y;Z|\{U_i\}, X)
    \end{split}
\end{aligned}$$

Unlike the other measures introduced so far, it can be both positive and
negative. A positive interaction information indicates that the three
variables share some common information. It is negative when there is
more information when taking the three variables together than
independently. To illustrate this property, we borrow the concept of
V-structure from causal diagrams. Consider the 4 possible DAGs with 3
nodes and two edges, shown in Fig
[\[fig:DAG_triplets\]](#fig:DAG_triplets){reference-type="ref"
reference="fig:DAG_triplets"}.

As Bayesian networks, the first three graphs encode the same conditional
dependencies :
$X \notindep Y$, and
$X \indep Y | Z$. In terms of
informations, $\operatorname{I}(X;Y) > 0$ and
$\operatorname{I}(X;Y|Z) = 0$. They all share some information, either
due to a common cause or having a continuous \"flow\" of information, so
$\operatorname{I}(X;Y;Z)$ is also positive. Only the fourth graph on the
right shows a different pattern : $X$ and $Y$ are marginally independent
($I(X;Y) = 0$), but become dependent when conditioning on $Z$
($\operatorname{I}(X;Y|Z)>0$). This is the situation where we \"create\"
information by looking at the interaction of the three variable, and the
three-point information $\operatorname{I}(X;Y;Z)$ is negative.


## Bibliography {#bibliography .unnumbered}

{{< bibliography cited >}}


